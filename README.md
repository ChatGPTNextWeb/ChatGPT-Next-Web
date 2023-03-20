This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

[API routes](https://nextjs.org/docs/api-routes/introduction) can be accessed on [http://localhost:3000/api/hello](http://localhost:3000/api/hello). This endpoint can be edited in `pages/api/hello.ts`.

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/api-routes/introduction) instead of React pages.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

## build log
### raw
Route (app)                                Size     First Load JS
┌ ○ /                                      449 kB          517 kB
├ λ /api/chat                              0 B                0 B
└ ℇ /api/chat-stream                       0 B                0 B
+ First Load JS shared by all              68.8 kB
  ├ chunks/455-0a9fbb1180548580.js         66.4 kB
  ├ chunks/main-app-19b36671ec6a549e.js    204 B
  └ chunks/webpack-dd78d1150b6f4f4a.js     2.15 kB

Route (pages)                              Size     First Load JS
─ ○ /404                                   179 B          84.6 kB
+ First Load JS shared by all              84.4 kB
  ├ chunks/main-303e01cd7449e20b.js        82.1 kB
  ├ chunks/pages/_app-907dedfd0e4177db.js  192 B

### dynamic markdown
Route (app)                                Size     First Load JS
┌ ○ /                                      64.2 kB         133 kB
├ λ /api/chat                              0 B                0 B
└ ℇ /api/chat-stream                       0 B                0 B
+ First Load JS shared by all              68.9 kB
  ├ chunks/455-0a9fbb1180548580.js         66.4 kB
  ├ chunks/main-app-19b36671ec6a549e.js    204 B
  └ chunks/webpack-3b3874680bea117d.js     2.26 kB

Route (pages)                              Size     First Load JS
─ ○ /404                                   179 B          84.7 kB
+ First Load JS shared by all              84.5 kB
  ├ chunks/main-303e01cd7449e20b.js        82.1 kB
  ├ chunks/pages/_app-907dedfd0e4177db.js  192 B
  └ chunks/webpack-3b3874680bea117d.js     2.26 kB

### dynamic emoji
Route (app)                                Size     First Load JS
┌ ○ /                                      16.1 kB          85 kB
├ λ /api/chat                              0 B                0 B
└ ℇ /api/chat-stream                       0 B                0 B
+ First Load JS shared by all              68.9 kB
  ├ chunks/455-0a9fbb1180548580.js         66.4 kB
  ├ chunks/main-app-19b36671ec6a549e.js    204 B
  └ chunks/webpack-2bfaffd64d73d7a1.js     2.33 kB

Route (pages)                              Size     First Load JS
─ ○ /404                                   179 B          84.8 kB
+ First Load JS shared by all              84.6 kB
  ├ chunks/main-303e01cd7449e20b.js        82.1 kB
  ├ chunks/pages/_app-907dedfd0e4177db.js  192 B
  └ chunks/webpack-2bfaffd64d73d7a1.js     2.33 kB