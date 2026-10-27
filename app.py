import os
import random
from flask import Flask, render_template, request, jsonify, session
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
app.secret_key = os.environ.get("SECRET_KEY", "super_secret_game_portal_key_2026")

users_db = {}

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/api/register", methods=["POST"])
def register():
    data = request.get_json() or {}
    phone = data.get("phone", "").strip()
    password = data.get("password", "").strip()

    if not phone or not password:
        return jsonify({"success": False, "message": "Telefon va parol kiritilishi shart!"}), 400

    if phone in users_db:
        return jsonify({"success": False, "message": "Bu telefon raqam allaqachon ro'yxatdan o'tgan!"}), 400

    user_id = str(random.randint(100000, 999999))
    users_db[phone] = {
        "user_id": user_id,
        "phone": phone,
        "password": generate_password_hash(password),
        "balance": 0.0  # Yangi foydalanuvchi balansi 0 UZS
    }

    session["user_phone"] = phone
    return jsonify({
        "success": True,
        "message": "Ro'yxatdan muvaffaqiyatli o'tdingiz!",
        "user": {
            "id": user_id,
            "phone": phone,
            "balance": users_db[phone]["balance"]
        }
    })

@app.route("/api/login", methods=["POST"])
def login():
    data = request.get_json() or {}
    phone = data.get("phone", "").strip()
    password = data.get("password", "").strip()

    user = users_db.get(phone)
    if not user or not check_password_hash(user["password"], password):
        return jsonify({"success": False, "message": "Telefon raqam yoki parol noto'g'ri!"}), 400

    session["user_phone"] = phone
    return jsonify({
        "success": True,
        "message": "Xush kelibsiz!",
        "user": {
            "id": user["user_id"],
            "phone": user["phone"],
            "balance": user["balance"]
        }
    })

@app.route("/api/me", methods=["GET"])
def me():
    phone = session.get("user_phone")
    if not phone or phone not in users_db:
        return jsonify({"authenticated": False}), 401

    user = users_db[phone]
    return jsonify({
        "authenticated": True,
        "user": {
            "id": user["user_id"],
            "phone": user["phone"],
            "balance": user["balance"]
        }
    })

@app.route("/api/logout", methods=["POST"])
def logout():
    session.pop("user_phone", None)
    return jsonify({"success": True})

@app.route("/api/update_balance", methods=["POST"])
def update_balance():
    phone = session.get("user_phone")
    if not phone or phone not in users_db:
        return jsonify({"success": False, "message": "Avtorizatsiyadan o'tilmagan"}), 401

    data = request.get_json() or {}
    amount = float(data.get("amount", 0))
    
    users_db[phone]["balance"] += amount
    if users_db[phone]["balance"] < 0:
        users_db[phone]["balance"] = 0.0

    return jsonify({
        "success": True,
        "new_balance": users_db[phone]["balance"]
    })

@app.route("/api/deposit_request", methods=["POST"])
def deposit_request():
    phone = session.get("user_phone")
    if not phone or phone not in users_db:
        return jsonify({"success": False, "message": "Avtorizatsiyadan o'tilmagan"}), 401
    
    data = request.get_json() or {}
    amount = float(data.get("amount", 0))
    if amount <= 0:
        return jsonify({"success": False, "message": "Noto'g'ri summa!"}), 400

    users_db[phone]["balance"] += amount
    return jsonify({
        "success": True,
        "message": f"{amount:,.0f} UZS balansga qo'shildi!",
        "new_balance": users_db[phone]["balance"]
    })

@app.route("/api/withdraw_request", methods=["POST"])
def withdraw_request():
    phone = session.get("user_phone")
    if not phone or phone not in users_db:
        return jsonify({"success": False, "message": "Avtorizatsiyadan o'tilmagan"}), 401
    
    data = request.get_json() or {}
    amount = float(data.get("amount", 0))
    card_number = data.get("card_number", "").strip()

    if not card_number or len(card_number) < 16:
        return jsonify({"success": False, "message": "Karta raqami noto'g'ri kiritildi!"}), 400

    if amount < 50000:
        return jsonify({"success": False, "message": "Eng kam yechib olish summasi: 50,000 UZS"}), 400

    user = users_db[phone]
    if user["balance"] < amount:
        return jsonify({"success": False, "message": "Balansingizda yetarli mablag' yo'q!"}), 400

    user["balance"] -= amount
    return jsonify({
        "success": True,
        "message": f"{amount:,.0f} UZS yechib olish uchun qabul qilindi!",
        "new_balance": user["balance"]
    })

if __name__ == "__main__":
    app.run(debug=True, port=5000)