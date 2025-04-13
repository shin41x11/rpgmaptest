# システム構成ドキュメント

## プロジェクト概要
このプロジェクトは、RPGマップを扱うWebアプリケーションです。フロントエンドとバックエンドが分離された構成となっています。

## ディレクトリ構造
```
.
├── client/          # フロントエンド
│   ├── src/        # ソースコード
│   └── public/     # 静的ファイル
├── server/         # バックエンド
│   ├── index.ts    # メインサーバー
│   ├── routes.ts   # ルーティング
│   ├── storage.ts  # ストレージ関連
│   └── vite.ts     # Vite設定
├── shared/         # 共有コード
│   └── schema.ts   # データスキーマ
└── 設定ファイル群
```

## 技術スタック

### フロントエンド
- **フレームワーク**: React 18
- **ビルドツール**: Vite
- **スタイリング**: 
  - Tailwind CSS
  - Radix UIコンポーネント
  - Framer Motion（アニメーション）
- **3Dレンダリング**:
  - Three.js
  - React Three Fiber
  - @react-three/drei
- **状態管理**:
  - Zustand
  - React Query
- **ルーティング**: React Router DOM
- **フォーム管理**: React Hook Form
- **バリデーション**: Zod

### バックエンド
- **ランタイム**: Node.js
- **フレームワーク**: Express
- **データベース**: 
  - Drizzle ORM
  - Neon Database（PostgreSQL）
- **認証**:
  - Passport.js
  - Express Session
- **WebSocket**: ws

### 開発ツール
- **言語**: TypeScript
- **パッケージマネージャー**: npm
- **ビルドツール**:
  - Vite
  - esbuild
- **CSS処理**:
  - PostCSS
  - Tailwind CSS
  - Autoprefixer

## 主要な機能
1. 3Dマップレンダリング
2. ユーザー認証
3. データ永続化
4. WebSocket通信
5. レスポンシブデザイン

## 開発環境
- Node.js
- TypeScript 5.6.3
- Vite 5.4.14
- その他の開発依存関係はpackage.jsonのdevDependenciesを参照

## デプロイメント
- ビルドコマンド: `npm run build`
- 起動コマンド: `npm start`
- 開発サーバー: `npm run dev`

## データベース
- Drizzle ORMを使用したスキーマ管理
- Neon Database（PostgreSQL）を使用
- マイグレーション: `npm run db:push`

## セキュリティ
- セッション管理: express-session
- 認証: passport-local
- データバリデーション: zod

## パフォーマンス最適化
- コード分割
- バンドル最適化
- 3Dレンダリングの最適化
- WebSocketによるリアルタイム通信 