# Bildyx

## 0. Clone project (if necessary)

```bash
git clone https://github.com/Bildyx/Bildyx.git
cd Bildyx
```

## 1. Install dependencies

```bash
curl -fsSL https://deb.nodesource.com/setup_24.x | sudo -E bash -
sudo apt-get install -y nodejs
npm install
```

## 2. Generate the prisma schema 

```bash
npm run db:pull
npm run db:generate
```

## 3. Start the API

```bash
cd apps/api
npm run dev
```

L'API sera accessible via l'url : http://localhost:3000/

## 4. Start the website

```bash
cd apps/website
```

Le site sera accessible via l'url : http://localhost:5500/
