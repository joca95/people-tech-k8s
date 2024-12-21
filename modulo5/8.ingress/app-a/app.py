from flask import Flask, jsonify
import os

app = Flask(__name__)

@app.route('/app-a/info', methods=['GET'])
def get_info():

    info = {
        "Aplication": "APP A",
        "Description": "Description of APP A",
    }

    return jsonify(info)

@app.route('/app-a', methods=['GET'])
def heath_check():
    msg = {
        "msg": "OK"
    }

    return jsonify(msg)

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000)