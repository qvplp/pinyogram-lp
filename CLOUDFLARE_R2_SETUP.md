# Cloudflare R2 配信URL設定ガイド

## 現在の状況
- R2バケット: `pinyogramlp`
- 画像パス: `events/セッション撮影会2025:09:16/main/card.png`
- 画像は存在しているが、公開配信URLが設定されていない

## 設定手順

### 1. R2の公開配信URLを取得

1. Cloudflareダッシュボードにログイン
2. R2 オブジェクト ストレージ > pinyogramlp バケット
3. 設定タブをクリック
4. 「公開配信URL」セクションを確認

### 2. 配信URLの形式

以下のいずれかの形式で配信URLが表示されます：

#### 形式A: デフォルト配信URL
```
https://pub-1234567890abcdef1234567890abcdef.r2.dev
```

#### 形式B: バケット名ベース
```
https://pinyogramlp.r2.dev
```

#### 形式C: カスタムドメイン（設定済みの場合）
```
https://cdn.pinyogram.com
```

### 3. 設定ファイルの更新

取得した配信URLを `shared/js/config.js` の `window.CDN_EVENTS_BASE` に設定：

```javascript
// 実際の配信URLに変更
window.CDN_EVENTS_BASE = 'https://pub-1234567890abcdef1234567890abcdef.r2.dev/pinyogramlp/events';
```

### 4. 生成されるURL例

設定後、以下のようなURLが生成されます：

- ヒーロー画像: `https://pub-1234567890abcdef1234567890abcdef.r2.dev/pinyogramlp/events/events/セッション撮影会2025:09:16/main/hero.jpg`
- モデル画像: `https://pub-1234567890abcdef1234567890abcdef.r2.dev/pinyogramlp/events/events/セッション撮影会2025:09:16/models/くりえみ.jpg`

### 5. 確認方法

1. ブラウザでページを開く
2. 開発者ツールのコンソールを確認
3. 生成されたURLを直接ブラウザで開いて画像が表示されるか確認

## トラブルシューティング

### 画像が表示されない場合

1. **配信URLが正しいか確認**
   - R2ダッシュボードで公開配信URLを再確認
   - バケットの公開設定が有効になっているか確認

2. **パスが正しいか確認**
   - オブジェクトキー: `events/セッション撮影会2025:09:16/main/card.png`
   - 生成URL: `{配信URL}/pinyogramlp/events/events/セッション撮影会2025:09:16/main/card.png`

3. **CORS設定の確認**
   - R2バケットのCORS設定で適切なドメインが許可されているか確認

## 現在の設定

```javascript
// プレースホルダー（実際のURLに変更が必要）
window.CDN_EVENTS_BASE = 'https://pub-1234567890abcdef1234567890abcdef.r2.dev/pinyogramlp/events';
```
