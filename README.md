# Bildyx

## 0. Clone project (if necessary)

```bash
git clone https://github.com/Bildyx/Bildyx.git
cd Bildyx
```

## 1. Orders to run

```bash
curl -fsSL https://deb.nodesource.com/setup_24.x | sudo -E bash -
sudo apt-get install -y nodejs

npm install
npm install prisma --save-dev
npm install @prisma/client
cd apps/api
npx prisma generate
```
