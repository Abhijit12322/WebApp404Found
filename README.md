# WildGuard AI

WildGuard AI is a lightweight, full‑stack wildlife monitoring system built with **Next.js**, **Flask**, and **Supabase**. It enables users to upload media, run ML-based detection, and view processed results through a clean, responsive interface.

---

## 🚀 Key Features

* Secure authentication via Supabase Auth
* Direct uploads to Supabase Storage
* Flask backend with integrated ML model
* Annotated output videos/images returned to users
* Detection history + danger alerts stored in Supabase

---

## 🏗️ Architecture

* **Frontend (Next.js):** Uploads media, handles auth, displays results.
* **Backend (Flask + ML):** Downloads file, runs inference, uploads processed output.
* **Supabase:** Auth, database, and file storage.

---



## 🗄️ Database Overview

* **detections:** ML outputs (media URLs, type, scores, JSON).
* **danger_alerts:** Threat alerts with levels + read state.
* **users:** App user profiles linked to `auth.users`.

---


## 🔒 Security

* Never expose Supabase service key.
* Use RLS for user‑scoped data access.

---

## 📄 License

MIT (or your choice).

---

WildGuard AI — fast, simple, and intelligent wildlife detection.
