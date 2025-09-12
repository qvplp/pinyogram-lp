# Cloudflare R2 配信URL設定ガイド

## 現在の状況
- R2バケット: `pinyogramlp`
- 画像パス: `events/セッション撮影会2025:09:16/main/card.png`
- 画像は存在しているが、公開配信URLが設定されていない
- **重要**: メインドメイン（pinyogram.com）をR2に設定すると404エラーが発生

## 推奨設定手順

### 1. サブドメインを使用したR2カスタムドメイン設定

**⚠️ 重要**: メインドメイン（pinyogram.com）は使用しないでください。サイトが404になります。

#### 推奨サブドメイン
```
cdn.pinyogram.com
assets.pinyogram.com
images.pinyogram.com
static.pinyogram.com
```

### 2. ステップバイステップ設定手順

#### ステップ1: CloudflareダッシュボードでR2設定

1. **Cloudflareダッシュボードにログイン**
   - https://dash.cloudflare.com にアクセス

2. **R2バケットに移動**
   - 左サイドバー > 「R2 オブジェクト ストレージ」
   - 「pinyogramlp」バケットをクリック

3. **設定タブをクリック**
   - バケット詳細画面で「設定」タブを選択

4. **公開配信URLを確認**
   - 「公開配信URL」セクションで現在のURLを確認
   - 例: `https://pub-1234567890abcdef1234567890abcdef.r2.dev`

#### ステップ2: カスタムドメインの設定

1. **「カスタムドメイン」セクションを探す**
   - R2設定画面で「カスタムドメイン」または「Custom Domain」を探す

2. **「ドメインを追加」をクリック**

3. **サブドメインを入力**
   ```
   cdn.pinyogram.com
   ```
   **注意**: `pinyogram.com` ではなく `cdn.pinyogram.com` を使用

4. **DNS設定を確認**
   - Cloudflareが自動的にDNSレコードを作成
   - CNAMEレコードが追加されることを確認

#### ステップ3: 設定の確認

1. **DNS設定の確認**
   - Cloudflareダッシュボード > DNS > レコード
   - `cdn` CNAME レコードが追加されていることを確認

2. **配信URLの確認**
   - R2設定画面で新しい配信URLを確認
   - 例: `https://cdn.pinyogram.com`

### 3. 配信URLの形式

#### 形式A: デフォルト配信URL（推奨：設定が簡単）
```
https://pub-1234567890abcdef1234567890abcdef.r2.dev
```

#### 形式B: カスタムサブドメイン（推奨：カスタムドメイン使用時）
```
https://cdn.pinyogram.com
```

#### 形式C: バケット名ベース（利用可能な場合）
```
https://pinyogramlp.r2.dev
```

### 4. 設定ファイルの更新

取得した配信URLを `shared/js/config.js` の `window.CDN_EVENTS_BASE` に設定：

#### デフォルト配信URLを使用する場合
```javascript
// 11行目を実際の配信URLに変更
window.CDN_EVENTS_BASE = 'https://pub-1234567890abcdef1234567890abcdef.r2.dev/pinyogramlp/events';
```

#### カスタムサブドメインを使用する場合
```javascript
// 11行目をカスタムドメインに変更
window.CDN_EVENTS_BASE = 'https://cdn.pinyogram.com/pinyogramlp/events';
```

### 5. 生成されるURL例

設定後、以下のようなURLが生成されます：

#### デフォルト配信URLの場合
- ヒーロー画像: `https://pub-1234567890abcdef1234567890abcdef.r2.dev/pinyogramlp/events/events/セッション撮影会2025:09:16/main/hero.jpg`
- モデル画像: `https://pub-1234567890abcdef1234567890abcdef.r2.dev/pinyogramlp/events/events/セッション撮影会2025:09:16/models/くりえみ.jpg`

#### カスタムサブドメインの場合
- ヒーロー画像: `https://cdn.pinyogram.com/pinyogramlp/events/events/セッション撮影会2025:09:16/main/hero.jpg`
- モデル画像: `https://cdn.pinyogram.com/pinyogramlp/events/events/セッション撮影会2025:09:16/models/くりえみ.jpg`

### 6. 動作確認手順

1. **設定ファイルを更新**
   - `shared/js/config.js` の11行目を実際の配信URLに変更

2. **変更をデプロイ**
   ```bash
   git add shared/js/config.js
   git commit -m "update: set actual R2 delivery URL"
   git push origin main
   ```

3. **ブラウザで確認**
   - ページを開く（ハードリフレッシュ: Ctrl+F5 / Cmd+Shift+R）
   - 開発者ツールのコンソールを確認
   - 生成されたURLを直接ブラウザで開いて画像が表示されるか確認

## トラブルシューティング

### 1. サイトが404になる場合

**原因**: メインドメイン（pinyogram.com）をR2に設定した
**解決策**: 
1. R2のカスタムドメイン設定を削除
2. サブドメイン（cdn.pinyogram.com）を使用して再設定

### 2. 画像が表示されない場合

1. **配信URLが正しいか確認**
   - R2ダッシュボードで公開配信URLを再確認
   - バケットの公開設定が有効になっているか確認

2. **パスが正しいか確認**
   - オブジェクトキー: `events/セッション撮影会2025:09:16/main/card.png`
   - 生成URL: `{配信URL}/pinyogramlp/events/events/セッション撮影会2025:09:16/main/card.png`

3. **CORS設定の確認**
   - R2バケットのCORS設定で適切なドメインが許可されているか確認

4. **DNS設定の確認**
   - カスタムドメイン使用時は、DNSレコードが正しく設定されているか確認

### 3. 設定のリセット方法

もし設定を間違えた場合：

1. **R2のカスタムドメインを削除**
   - R2設定画面でカスタムドメインを削除

2. **DNSレコードを削除**
   - Cloudflareダッシュボード > DNS > レコード
   - 追加したCNAMEレコードを削除

3. **デフォルト配信URLを使用**
   - 設定ファイルでデフォルト配信URLに戻す

## 現在の設定

```javascript
// プレースホルダー（実際のURLに変更が必要）
window.CDN_EVENTS_BASE = 'https://pub-1234567890abcdef1234567890abcdef.r2.dev/pinyogramlp/events';
```

## 推奨設定

**初心者向け**: デフォルト配信URLを使用（設定が簡単）
**上級者向け**: カスタムサブドメインを使用（ブランド統一）
