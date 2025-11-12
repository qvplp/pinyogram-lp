/* ===================================
   モデル一覧ページ JavaScript
   =================================== */

class ModelsIndexPage {
    constructor() {
        this.modelsData = null;
        this.selectedCategory = 'ALL';
        this.init();
    }
    
    async init() {
        try {
            await this.loadData();
            this.renderCategoryFilter();
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
    
    getCategoryCounts() {
        const counts = {
            'ALL': this.modelsData.models.length,
            'IDOL': 0,
            'MODEL': 0,
            'COSPLAYER': 0,
            'GRAVURE': 0,
            'TALENT': 0
        };
        
        this.modelsData.models.forEach(model => {
            if (model.category) {
                // 配列の場合は各カテゴリをカウント、文字列の場合は後方互換性のためそのままカウント
                const categories = Array.isArray(model.category) ? model.category : [model.category];
                categories.forEach(cat => {
                    if (counts.hasOwnProperty(cat)) {
                        counts[cat]++;
                    }
                });
            }
        });
        
        return counts;
    }
    
    getCategoryLabels() {
        return {
            'ALL': 'All',
            'IDOL': 'Idol',
            'MODEL': 'Model',
            'COSPLAYER': 'Cosplayer',
            'GRAVURE': 'Gravure',
            'TALENT': 'Talent'
        };
    }
    
    renderCategoryFilter() {
        const categoryFilter = document.getElementById('category-filter');
        if (!categoryFilter || !this.modelsData) return;
        
        const counts = this.getCategoryCounts();
        const labels = this.getCategoryLabels();
        const categories = ['ALL', 'IDOL', 'MODEL', 'COSPLAYER', 'GRAVURE', 'TALENT'];
        
        categoryFilter.innerHTML = '';
        
        categories.forEach(category => {
            const button = document.createElement('button');
            button.className = 'category-filter-button';
            if (this.selectedCategory === category) {
                button.classList.add('active');
            }
            button.textContent = `${labels[category]} `;
            
            const countSpan = document.createElement('span');
            countSpan.className = 'count';
            countSpan.textContent = counts[category];
            button.appendChild(countSpan);
            
            button.addEventListener('click', () => {
                this.selectedCategory = category;
                this.renderCategoryFilter();
                this.renderModels();
            });
            
            categoryFilter.appendChild(button);
        });
    }
    
    getFilteredModels() {
        if (!this.modelsData) return [];
        
        if (this.selectedCategory === 'ALL') {
            return this.modelsData.models;
        }
        
        return this.modelsData.models.filter(model => {
            if (!model.category) return false;
            // 配列の場合は含まれているかチェック、文字列の場合は後方互換性のためそのまま比較
            const categories = Array.isArray(model.category) ? model.category : [model.category];
            return categories.includes(this.selectedCategory);
        });
    }
    
    renderModels() {
        const modelsGrid = document.getElementById('models-grid');
        if (!modelsGrid || !this.modelsData) return;
        
        modelsGrid.innerHTML = '';
        
        const filteredModels = this.getFilteredModels();
        
        if (filteredModels.length === 0) {
            modelsGrid.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px;">
                    <p style="font-size: 18px; color: var(--gray-600);">該当するモデルが見つかりませんでした</p>
                </div>
            `;
            return;
        }
        
        filteredModels.forEach(model => {
            const modelCard = document.createElement('a');
            modelCard.href = `/models/detail.html?id=${model.model_id}`;
            modelCard.className = 'model-card';
            
            const categoryLabels = this.getCategoryLabels();
            // 配列の場合はすべてのカテゴリを表示、文字列の場合は後方互換性のためそのまま表示
            const categories = model.category 
                ? (Array.isArray(model.category) ? model.category : [model.category])
                : [];
            
            const categoryTags = categories.map(cat => {
                const label = categoryLabels[cat] || cat;
                return `<span class="model-card-category">${label}</span>`;
            }).join('');
            
            modelCard.innerHTML = `
                <div class="model-card-image-wrapper">
                    <img src="${model.profile_image}" 
                         alt="${model.name}のプロフィール画像" 
                         class="model-card-image"
                         onerror="this.src='/assets/images/common/placeholder.jpg'">
                    ${categoryTags ? `<div class="model-card-categories">${categoryTags}</div>` : ''}
                </div>
                <div class="model-card-content">
                    <h2 class="model-card-name">${model.name}</h2>
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
