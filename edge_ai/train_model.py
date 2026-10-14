import numpy as np
import pandas as pd
from sklearn.tree import DecisionTreeClassifier
from micromlgen import port
import os

# 1. Generate Synthetic Data
print("Generating synthetic data based on standard environmental thresholds...")
np.random.seed(42)
num_samples = 2000

# Features: temperature, soil_moisture, rain_value, pressure
temperatures = np.random.uniform(10, 45, num_samples)
soil_moistures = np.random.uniform(0, 100, num_samples)
rain_values = np.random.uniform(0, 100, num_samples) # Assuming 0-100 scale for simplicity
pressures = np.random.uniform(900, 1100, num_samples)

X = np.column_stack((temperatures, soil_moistures, rain_values, pressures))
y = np.zeros(num_samples, dtype=int)

# 0 = LOW, 1 = MEDIUM, 2 = HIGH, 3 = CRITICAL
for i in range(num_samples):
    temp = temperatures[i]
    soil = soil_moistures[i]
    rain = rain_values[i]
    pressure = pressures[i]
    
    if rain > 75 and soil > 85:
        y[i] = 3 # CRITICAL (High flood/landslide risk)
    elif rain > 55 and soil > 65:
        y[i] = 2 # HIGH
    elif pressure < 1005 and rain > 20:
        y[i] = 1 # MEDIUM (Low pressure + some rain = potential storm)
    elif temp > 40 and soil < 20:
        y[i] = 2 # HIGH (Drought/Heatwave risk, optional standard value)
    else:
        y[i] = 0 # LOW

df = pd.DataFrame(X, columns=['temperature', 'soil_moisture', 'rain_value', 'pressure'])
df['risk_level'] = y
df.to_csv('synthetic_sensor_data.csv', index=False)
print(f"Generated {num_samples} samples and saved to synthetic_sensor_data.csv")

# 2. Train the Decision Tree
print("Training Decision Tree Classifier...")
clf = DecisionTreeClassifier(max_depth=5, min_samples_split=5)
clf.fit(X, y)

accuracy = clf.score(X, y)
print(f"Model Accuracy on training data: {accuracy * 100:.2f}%")

# 3. Export to C Header File for ESP32
print("Exporting model to C++ header for ESP32...")
c_code = port(clf)

with open('model.h', 'w') as f:
    f.write(c_code)
    
print("Successfully generated model.h!")
print("Copy model.h into your ESP32 Arduino project folder.")
