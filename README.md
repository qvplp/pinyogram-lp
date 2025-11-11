# ぴにょぐらむphoto session プロジェクト

## プロジェクト概要
ぴにょぐらむphoto sessionの公式ウェブサイトです。プロの撮影イベントとフォトコンテストを提供しています。

## フォルダ構成

```
pinyogram_lp/
├── index.html                     # メインページ（ランディング）
├── event/                         # イベント関連
│   ├── index.html                 # イベント一覧ページ
│   ├── event-detail.html          # イベント詳細ページ
│   ├── assets/                    # イベント専用アセット
│   │   ├── images/
│   │   │   ├── events/            # イベント画像
│   │   │   ├── hero/              # ヒーロー画像
│   │   │   └── models/            # モデル画像
│   │   └── icons/
│   ├── css/                       # イベント専用CSS
│   ├── js/                        # イベント専用JS
│   └── data/
│       └── events.json            # イベントデータ
├── contest/                       # コンテスト関連
│   ├── contest.html               # コンテストページ
│   ├── assets/                    # コンテスト専用アセット
│   │   ├── images/
│   │   │   ├── contests/          # コンテスト画像
│   │   │   │   ├── banners/       # バナー画像
│   │   │   │   ├── prizes/        # 賞品画像
│   │   │   │   ├── winners/       # 受賞者画像
│   │   │   │   └── themes/        # テーマ画像
│   │   │   └── submissions/       # ユーザー応募作品
│   │   │       ├── 2025/          # 年別フォルダ
│   │   │       └── sample/        # サンプル作品
│   │   └── icons/
│   ├── css/
│   └── js/
├── shared/                        # 共通リソース
│   ├── css/                       # 共通CSS
│   ├── js/                        # 共通JS
│   └── assets/
│       └── images/
│           └── common/            # 共通画像
└── README.md                      # このファイル
```

## 機能

### イベント機能
- イベント一覧表示
- イベント詳細ページ
- カレンダー表示
- 予約システム

### コンテスト機能
- フォトコンテスト一覧
- 応募作品ギャラリー
- 受賞作品表示
- 応募システム

## 技術スタック
- HTML5
- CSS3
- JavaScript (ES6+)
- Font Awesome
- レスポンシブデザイン

## 開発環境
- Node.js
- npm

## セットアップ
1. リポジトリをクローン
2. `npm install` で依存関係をインストール
3. ローカルサーバーで実行

## デプロイ
- Vercel対応
- 静的サイトとしてデプロイ可能

## ライセンス
© 2025 ぴにょぐらむphoto session. All rights reserved.
