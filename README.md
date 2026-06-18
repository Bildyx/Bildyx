# Bildyx

## 1. Créez un environnement virtuel (optionnel mais recommandé) :

```bash
python -m venv venv
source venv/bin/activate   # ou venv\Scripts\activate sur Windows
```

## 2. Installez les dépendances à partir du fichier `requirements.txt` :

```bash
pip install -r requirements.txt
```

## 3. Orders to run
```bash
npm install
npm install prisma --save-dev
npm install @prisma/client
npx prisma generate
```