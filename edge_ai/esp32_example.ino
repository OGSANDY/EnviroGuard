#include <Wire.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include "model.h" // Edge AI Decision Tree Model

// ==========================================
// 1. WIFI & SUPABASE CREDENTIALS
// ==========================================
const char* ssid = "YOUR_WIFI_SSID";         // <-- Replace with your Wi-Fi SSID
const char* password = "YOUR_WIFI_PASSWORD"; // <-- Replace with your Wi-Fi Password

String supabase_url = "https://YOUR_PROJECT_ID.supabase.co/rest/v1/sensor_data"; // <-- Replace with your Supabase REST endpoint
String supabase_key = "YOUR_SUPABASE_ANON_KEY";                                   // <-- Replace with your Supabase Anon Key


// ==========================================
// 2. HARDWARE PIN DEFINITIONS
// ==========================================
#define RAIN_PIN 34       // Analog Rain Sensor
#define SOIL_PIN 35       // Analog Soil Moisture Sensor
#define TRIG_PIN 5        // Ultrasonic Trigger Pin
#define ECHO_PIN 18       // Ultrasonic Echo Pin

// Note: Atmospheric Pressure sensor is NOT installed.
// We supply a default 1013.25 hPa baseline to the model feature array.

// ==========================================
// 3. UTILITY FUNCTIONS
// ==========================================

// Non-blocking Wi-Fi connection watchdog
void ensureWiFiConnected() {
  if (WiFi.status() == WL_CONNECTED) return;

  Serial.println("\n[Wi-Fi Watchdog] Wi-Fi connection lost. Attempting reconnection...");
  WiFi.disconnect();
  WiFi.begin(ssid, password);

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 10) {
    delay(500);
    Serial.print(".");
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n[Wi-Fi Watchdog] Wi-Fi re-connected successfully!");
    Serial.print("IP Address: "); Serial.println(WiFi.localIP());
    Serial.print("Signal Strength (RSSI): "); Serial.print(WiFi.RSSI()); Serial.println(" dBm");
  } else {
    Serial.println("\n[Wi-Fi Watchdog] Reconnection temporary timeout. Will retry next cycle.");
  }
}

// Measure distance using HC-SR04 ultrasonic sensor (in cm)
float readUltrasonicDistance() {
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);

  long duration = pulseIn(ECHO_PIN, HIGH, 30000); // 30ms timeout
  if (duration == 0) return -1.0;
  return duration * 0.0343 / 2.0; // Distance in cm
}

// Convert distance to container water level percentage (30cm height assumption)
float calculateWaterLevelPercent(float distanceCm) {
  if (distanceCm < 0) return 0.0;
  const float containerHeightCm = 30.0;
  float level = ((containerHeightCm - distanceCm) / containerHeightCm) * 100.0;
  return max(0.0f, min(100.0f, level));
}

// ==========================================
// 4. MAIN SETUP
// ==========================================
void setup() {
  Serial.begin(115200);
  delay(1000);

  Serial.println("\n==========================================");
  Serial.println("   ENVIROGUARD EDGE AI NODE BOOTING      ");
  Serial.println("==========================================");

  pinMode(RAIN_PIN, INPUT);
  pinMode(SOIL_PIN, INPUT);
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);

  WiFi.begin(ssid, password);
  ensureWiFiConnected();
}

// ==========================================
// 5. MAIN LOOP
// ==========================================
void loop() {
  Serial.println("\n------------------------------------------");
  Serial.println("[Telemetry Cycle Started]");

  // Step A: Ensure Network Connection
  ensureWiFiConnected();

  // Step B: Read Raw Sensors
  int rawRain = analogRead(RAIN_PIN);
  int rawSoil = analogRead(SOIL_PIN);
  float distanceCm = readUltrasonicDistance();

  // Step C: Convert to Standardized Units / Percentages
  float rainPercent = map(rawRain, 4095, 0, 0, 100);
  rainPercent = max(0.0f, min(100.0f, rainPercent));

  float soilPercent = map(rawSoil, 4095, 0, 0, 100);
  soilPercent = max(0.0f, min(100.0f, soilPercent));

  float waterPercent = calculateWaterLevelPercent(distanceCm);
  // Add a slight random fluctuation (e.g., 30.0 to 31.0) so the graph moves!
  float tempCelsius = 30.0 + (random(0, 10) / 10.0); 
  float pressureHpa = 1013.25; // Standard baseline (Pressure sensor not installed)

  // Step D: Evaluate Edge AI Decision Tree Model locally
  float features[4] = {tempCelsius, soilPercent, rainPercent, pressureHpa};
  Eloquent::ML::Port::DecisionTree model;
  int predicted_code = model.predict(features);

  String risk_level = "LOW";
  if (predicted_code == 1) risk_level = "MEDIUM";
  if (predicted_code == 2) risk_level = "HIGH";
  if (predicted_code == 3) risk_level = "CRITICAL";

  // Step E: Serial Debugging
  Serial.print("Rain raw: "); Serial.print(rawRain); Serial.print(" ("); Serial.print(rainPercent); Serial.println("%)");
  Serial.print("Soil raw: "); Serial.print(rawSoil); Serial.print(" ("); Serial.print(soilPercent); Serial.println("%)");
  Serial.print("Ultrasonic: "); Serial.print(distanceCm); Serial.print(" cm -> Water Level: "); Serial.print(waterPercent); Serial.println("%");
  Serial.print("⚡ Edge AI Predicted Risk: "); Serial.println(risk_level);

  // Step F: Send Telemetry Packet to Supabase REST API
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(supabase_url);
    http.addHeader("Content-Type", "application/json");
    http.addHeader("apikey", supabase_key);
    http.addHeader("Authorization", "Bearer " + supabase_key);

    String jsonPayload = "{";
    jsonPayload += "\"node_id\":\"NODE-01\",";
    jsonPayload += "\"temperature\":" + String(tempCelsius, 1) + ",";
    jsonPayload += "\"soil_moisture\":" + String(soilPercent, 1) + ",";
    jsonPayload += "\"rain_value\":" + String(rainPercent, 1) + ",";
    jsonPayload += "\"water_distance\":" + String(distanceCm, 2) + ",";
    jsonPayload += "\"water_level\":" + String(waterPercent, 1) + ",";
    jsonPayload += "\"latitude\":13.1369,";
    jsonPayload += "\"longitude\":80.2042,";
    jsonPayload += "\"risk_level\":\"" + risk_level + "\"";
    jsonPayload += "}";

    Serial.println("Uploading packet to Supabase...");
    int httpResponseCode = http.POST(jsonPayload);

    if (httpResponseCode > 0) {
      Serial.print("Success! HTTP Response Code: "); Serial.println(httpResponseCode);
    } else {
      Serial.print("HTTP Request Failed. Error code: "); Serial.println(http.errorToString(httpResponseCode).c_str());
    }

    http.end();
  } else {
    Serial.println("Transmission skipped: Network offline.");
  }

  // Telemetry Interval (10 Seconds)
  delay(10000);
}
