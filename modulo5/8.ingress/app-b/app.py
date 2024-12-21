from flask import Flask, jsonify
import os

app = Flask(__name__)

@app.route('/app-b/info', methods=['GET'])
def get_info():

    info = {
        "Aplication": "APP B",
        "Description": "Description of APP B",
    }

    return jsonify(info)

@app.route('/app-b', methods=['GET'])
def heath_check():
    msg = {
        "msg": "OK"
    }

    return jsonify(msg)

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000)