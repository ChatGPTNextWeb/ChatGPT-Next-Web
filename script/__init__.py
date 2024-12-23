import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense
from tensorflow.keras.utils import to_categorical
import pandas as pd
from sklearn.model_selection import train_test_split

# Load your dataset
data = pd.read_csv('path/to/your/dataset.csv')

# Assuming the last column is the label
labels = data.iloc[:, -1]
features = data.iloc[:, :-1]

# Convert labels to categorical if necessary
labels = to_categorical(labels)

# Split the data into training and testing sets
train_data, test_data, train_labels, test_labels = train_test_split(features, labels, test_size=0.2)

# Build the model
model = Sequential([
Dense(64, input_shape=(features.shape[1],), activation='relu'),
Dense(64, activation='relu'),
Dense(labels.shape[1], activation='softmax')
])

# Compile the model
model.compile(optimizer='adam',
loss='categorical_crossentropy',
metrics=['accuracy'])

# Train the model
model.fit(train_data, train_labels, epochs=50, batch_size=32)

# Evaluate the model
loss, accuracy = model.evaluate(test_data, test_labels)
print(f'Test accuracy: {accuracy}')
