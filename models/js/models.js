/* ===================================
   モデル一覧ページ JavaScript
   =================================== */

class ModelsIndexPage {
    constructor() {
        this.modelsData = null;
        this.init();
    }
    
    async init() {
        try {
            await this.loadData();
            this.renderModels();
            this.setupEventListeners();
        } catch (error) {
            console.error('ページの初期化に失敗しました:', error);
            this.showError('ページの読み込みに失敗しました。');
        }
    }
    
    async loadData() {
        try {
            const response = await fetch('/models/data/models.json?v=20241016');
            if (!response.ok) {
                throw new Error('データの読み込みに失敗しました');
            }
            this.modelsData = await response.json();
        } catch (error) {
            console.error('データ読み込みエラー:', error);
            throw error;
        }
    }
    
    renderModels() {
        const modelsGrid = document.getElementById('models-grid');
        if (!modelsGrid || !this.modelsData) return;
        
        modelsGrid.innerHTML = '';
        
        this.modelsData.models.forEach(model => {
            const modelCard = document.createElement('a');
            modelCard.href = `/models/detail.html?id=${model.model_id}`;
            modelCard.className = 'model-card';
            
            modelCard.innerHTML = `
                <img src="${model.profile_image}" 
                     alt="${model.name}のプロフィール画像" 
                     class="model-card-image"
                     onerror="this.src='/assets/images/common/placeholder.jpg'">
                <h2 class="model-card-name">${model.name}</h2>
                <div class="model-card-button">
                    <i class="fas fa-user"></i>
                    詳細を見る
                </div>
            `;
            
            modelsGrid.appendChild(modelCard);
        });
    }
    
    async setupEventListeners() {
        // ヘッダー・フッターの読み込み
        await this.loadHeaderFooter();
    }
    
    async loadHeaderFooter() {
        try {
            const headerResponse = await fetch('/shared/header.html');
            const footerResponse = await fetch('/shared/footer.html');
            
            if (headerResponse.ok) {
                const headerHtml = await headerResponse.text();
                document.getElementById('header-container').innerHTML = headerHtml;
            }
            
            if (footerResponse.ok) {
                const footerHtml = await footerResponse.text();
                document.getElementById('footer-container').innerHTML = footerHtml;
            }
            
        } catch (error) {
            console.error('ヘッダー・フッターの読み込みに失敗:', error);
        }
    }
    
    showError(message) {
        const main = document.querySelector('.models-index-page');
        if (main) {
            main.innerHTML = `
                <div style="text-align: center; padding: 60px 20px;">
                    <h1 style="color: var(--accent); margin-bottom: 20px;">エラー</h1>
                    <p style="color: var(--gray-700); font-size: 18px;">${message}</p>
                    <a href="/" style="display: inline-block; margin-top: 20px; padding: 12px 24px; background: var(--primary); color: white; text-decoration: none; border-radius: 8px;">ホームに戻る</a>
                </div>
            `;
        }
    }
}

// ページ読み込み完了後に初期化
document.addEventListener('DOMContentLoaded', () => {
    new ModelsIndexPage();
});
