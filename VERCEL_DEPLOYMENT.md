# Vercel デプロイメントガイド

## 概要

このドキュメントでは、ぴにょぐらむphoto sessionプロジェクトをVercelにデプロイする手順を説明します。

## 前提条件

- Vercelアカウントを持っていること
- GitHubリポジトリにアクセスできること
- 開発環境（devブランチ）が準備されていること

## デプロイ手順

### 1. Vercelプロジェクトの作成

1. [Vercelダッシュボード](https://vercel.com/dashboard)にログイン
2. 「Add New...」→「Project」をクリック
3. GitHubリポジトリを選択（`qvplp/pinyogram-lp`）
4. プロジェクト設定を確認

### 2. ブランチ設定

- **Production Branch**: `main` または `master`（本番環境）
- **Preview Branches**: `dev`（開発環境）

### 3. ビルド設定

Vercelは自動的に `vercel.json` を読み込みます。以下の設定が適用されます：

- **Framework Preset**: Other（静的サイト）
- **Build Command**: `npm run build`
- **Output Directory**: `.`（ルートディレクトリ）
- **Install Command**: `npm install`

### 4. 環境変数の設定

Vercelダッシュボードで環境変数を設定：

1. プロジェクト設定 → 「Environment Variables」
2. 以下の環境変数を追加：

```
NEXT_PUBLIC_CDN_EVENTS_BASE=https://images.pinyogram.com/events
NEXT_PUBLIC_APP_NAME=ぴにょぐらむphoto session
NEXT_PUBLIC_APP_URL=https://pinyogram.com
NODE_ENV=production
VERCEL_ENV=production
```

**重要**: 環境ごとに異なる値を設定する場合：
- **Production**: 本番環境のURL
- **Preview**: 開発環境のURL
- **Development**: ローカル開発環境のURL

### 5. カスタムドメインの設定（オプション）

1. プロジェクト設定 → 「Domains」
2. カスタムドメインを追加
3. DNS設定を確認

### 6. デプロイの実行

#### 方法1: GitHub連携（推奨）

- `dev`ブランチにプッシュすると自動的にプレビューデプロイが実行されます
- プルリクエストを作成すると、プレビューURLが自動生成されます

#### 方法2: Vercel CLI

```bash
# Vercel CLIをインストール
npm i -g vercel

# ログイン
vercel login

# デプロイ（開発環境）
vercel --prod=false

# 本番環境にデプロイ
vercel --prod
```

### 7. デプロイの確認

1. Vercelダッシュボードでデプロイステータスを確認
2. プレビューURLにアクセスして動作確認
3. エラーログを確認（問題がある場合）

## 環境別設定

### 開発環境（devブランチ）

- **URL**: `https://pinyogram-lp-dev.vercel.app`（自動生成）
- **環境変数**: `VERCEL_ENV=preview`
- **CDN URL**: 開発環境用のCDN URLを設定

### 本番環境（main/masterブランチ）

- **URL**: カスタムドメインまたは `https://pinyogram-lp.vercel.app`
- **環境変数**: `VERCEL_ENV=production`
- **CDN URL**: 本番環境用のCDN URLを設定

## トラブルシューティング

### ビルドエラー

- `package.json`の`build`スクリプトを確認
- 依存関係が正しくインストールされているか確認
- ビルドログを確認

### リダイレクトが機能しない

- `vercel.json`の`redirects`設定を確認
- パスの大文字小文字を確認

### 環境変数が反映されない

- 環境変数の命名規則を確認（`NEXT_PUBLIC_`プレフィックスが必要な場合）
- デプロイ後に環境変数を再設定
- ブラウザのキャッシュをクリア

### 画像が表示されない

- Cloudflare R2のCDN URL設定を確認
- CORS設定を確認
- `shared/js/config.js`の設定を確認

## 参考リンク

- [Vercel公式ドキュメント](https://vercel.com/docs)
- [Vercel環境変数設定](https://vercel.com/docs/concepts/projects/environment-variables)
- [Vercelリダイレクト設定](https://vercel.com/docs/concepts/projects/project-configuration#redirects)

## 注意事項

- 開発環境と本番環境で異なるCDN URLを使用する場合は、環境変数で管理してください
- 機密情報は環境変数で管理し、リポジトリにコミットしないでください
- デプロイ前に必ずローカル環境で動作確認を行ってください

