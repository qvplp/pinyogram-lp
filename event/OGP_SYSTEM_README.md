# イベントOGPシステム 実装ガイド

## 概要

このシステムは、ぴにょぐらむphoto sessionのイベントページでOGP（Open Graph Protocol）を動的に生成・管理するためのシステムです。新規イベント登録時に自動的にOGPページが生成され、SNSでのシェア時に適切な画像と情報が表示されます。

## 実装内容

### 1. EVT004のOGP更新 ✅

**ファイル**: `/event/EVT004/index.html`

- プレースホルダー画像から実際のイベント画像に変更
- 画像URL: `https://images.pinyogram.com/events/%E3%82%BB%E3%83%83%E3%82%B7%E3%83%A7%E3%83%B3%E6%92%AE%E5%BD%B1%E4%BC%9A2025%3A09%3A16/main/hero.png`
- 画像のalt属性も追加

### 2. 動的OGP生成システム ✅

**ファイル**: `/event/js/ogp-generator.js`

- イベントデータからOGPメタタグを自動生成
- Cloudflare R2の画像URL構造に対応
- イベントスラッグのURLエンコード処理
- テンプレートベースのHTML生成

**主要機能**:
- `generateEventImageUrl()`: イベント画像URL生成
- `generateOGPHTML()`: 完全なOGPページHTML生成
- `generateOGPMetaTags()`: メタタグオブジェクト生成

### 3. イベント管理システム ✅

**ファイル**: `/event/js/event-manager.js`

- 新規イベント登録・更新機能
- OGPページの自動生成・更新
- イベントID・スラッグの自動生成
- 一括OGP再生成機能

**主要機能**:
- `createEvent()`: 新規イベント作成
- `updateEvent()`: イベント更新
- `regenerateOGP()`: OGPページ再生成
- `regenerateAllOGP()`: 全イベントOGP一括再生成

### 4. イベント詳細ページの動的OGP ✅

**ファイル**: `/event/event-detail.html`

- 動的OGPメタタグ更新機能を追加
- イベントデータ読み込み時にOGPを自動更新
- リアルタイムでのメタタグ変更

**追加された機能**:
- `updateOGPMetaTags()`: 動的OGP更新
- `updateMetaTag()`: メタタグ更新ヘルパー

### 5. 管理画面 ✅

**ファイル**: `/event/admin/event-create.html`

- 新規イベント登録用の管理画面
- OGPプレビュー機能
- リアルタイムでのプレビュー更新

## 使用方法

### 新規イベント登録

1. `/event/admin/event-create.html` にアクセス
2. イベント情報を入力
3. OGPプレビューで確認
4. 「イベントを作成」ボタンをクリック
5. 自動的にOGPページが生成される

### 既存イベントのOGP更新

```javascript
// 特定のイベントのOGPを再生成
const eventManager = new EventManager();
await eventManager.regenerateOGP('EVT004');

// 全イベントのOGPを一括再生成
await eventManager.regenerateAllOGP();
```

### イベントデータの構造

```javascript
const eventData = {
    event_id: 'EVT004',
    event_name: 'ぴにょぐらむphoto session 2025/09/16',
    event_date: '2025-09-16',
    description: '少人数ぴにょぐらむphoto session',
    slug: 'ぴにょぐらむphoto session 2025:09:16',
    venue: {
        venue_name: 'Gスタ',
        address: '東京都台東区浅草橋５丁目３−２'
    },
    pricing: {
        perUnit: 10000,
        twoParts: 19000,
        threeParts: 28000
    },
    models: [
        { name: 'くりえみ', role: '', image: 'くりえみ.png' },
        { name: '（まろ）', role: '', image: 'まろ.png' }
    ]
};
```

## 画像URL生成ルール

### Cloudflare R2のパス構造

```
https://images.pinyogram.com/events/{ENCODED_SLUG}/{TYPE}/{NAME}.{EXT}
```

**例**:
- メイン画像: `https://images.pinyogram.com/events/ぴにょぐらむphoto session 2025%3A09%3A16/main/hero.png`
- モデル画像: `https://images.pinyogram.com/events/ぴにょぐらむphoto session 2025%3A09%3A16/models/1.png`

### スラッグエンコード

- スラッシュ `/` → コロン `:`
- URLエンコード処理
- 例: `ぴにょぐらむphoto session 2025/09/16` → `ぴにょぐらむphoto session 2025%3A09%3A16`

## 生成されるOGPメタタグ

```html
<!-- Open Graph / Facebook -->
<meta property="og:type" content="website">
<meta property="og:site_name" content="ぴにょぐらむphoto session">
<meta property="og:title" content="イベント名">
<meta property="og:description" content="イベント説明">
<meta property="og:image" content="https://images.pinyogram.com/events/.../main/hero.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="イベント名 - イベント説明">
<meta property="og:url" content="https://example.com/event/EVT004/">

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="イベント名">
<meta name="twitter:description" content="イベント説明">
<meta name="twitter:image" content="https://images.pinyogram.com/events/.../main/hero.png">
<meta name="twitter:image:alt" content="イベント名 - イベント説明">
```

## 今後の拡張予定

1. **サーバーサイド統合**: 実際のファイル生成・保存機能
2. **バッチ処理**: 大量のイベント一括処理
3. **画像最適化**: 自動リサイズ・圧縮機能
4. **キャッシュ管理**: OGPページのキャッシュ制御
5. **エラーハンドリング**: 画像読み込み失敗時のフォールバック

## 注意事項

- 現在の実装はクライアントサイドのみ
- 実際のファイル生成にはサーバーサイド実装が必要
- 画像URLはCloudflare R2の構造に依存
- イベントスラッグは一意である必要がある

## トラブルシューティング

### OGP画像が表示されない場合

1. 画像URLが正しいか確認
2. Cloudflare R2のアクセス権限を確認
3. スラッグのエンコードが正しいか確認

### メタタグが更新されない場合

1. ブラウザのキャッシュをクリア
2. JavaScriptエラーをコンソールで確認
3. イベントデータの構造を確認

---

このシステムにより、新規イベント登録時に自動的にOGPページが生成され、SNSでのシェア時に適切な画像と情報が表示されるようになります。
