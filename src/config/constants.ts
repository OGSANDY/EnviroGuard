// Central configuration for EnviroGuard System

export const SYSTEM_CONFIG = {
  // Node ID
  DEFAULT_NODE_ID: 'NODE-01',

  // Timeout Thresholds (in milliseconds)
  NODE_ONLINE_TIMEOUT_MS: 60000,    // < 60s: Hardware is ONLINE
  NODE_STALE_TIMEOUT_MS: 120000,   // 60s - 120s: Hardware is STALE
  POLL_INTERVAL_MS: 10000,          // 10s fallback polling

  // Water Container Dimensions (in cm)
  // Water Level % = max(0, min(100, ((CONTAINER_HEIGHT_CM - distance_cm) / CONTAINER_HEIGHT_CM) * 100))
  DEFAULT_CONTAINER_HEIGHT_CM: 30,

  // Hardware Capabilities
  HAS_ATMOSPHERIC_PRESSURE_SENSOR: false, // Set to true if BME280/BMP280 is added
  HAS_HARDWARE_GPS: false,                 // Set to true if NEO-6M GPS module is added
};
