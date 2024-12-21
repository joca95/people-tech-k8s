from flask import Flask, jsonify
import os

app = Flask(__name__)

@app.route('/secrets', methods=['GET'])
def get_secrets():
    credentials_database = os.getenv('CREDENTIALS_DB')
    config_value = os.getenv('CONFIG_VALUE')

    secrets = {
        "Database Credentials": credentials_database,
        "Config Value": config_value
    }

    return jsonify(secrets)

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000)