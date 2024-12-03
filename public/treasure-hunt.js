class TreasureHunt {
  constructor(shopDomain) {
    this.shopDomain = shopDomain;
    this.pageViews = parseInt(localStorage.getItem('treasureHuntPageViews') || '0');
    this.timeSpent = 0;
    this.treasures = [];
    this.initialized = false;
    
    // Increment page views
    this.pageViews++;
    localStorage.setItem('treasureHuntPageViews', this.pageViews.toString());
  }

  async initialize() {
    if (this.initialized) return;
    
    try {
      // Fetch treasures for this shop
      const response = await fetch(`/api/treasures?shop=${this.shopDomain}`);
      const data = await response.json();
      
      if (data.error) {
        console.error('TreasureHunt:', data.error);
        return;
      }

      this.treasures = data.treasures;
      this.initialized = true;

      // Start tracking time
      this.startTimeTracking();

      // Check for treasures that should be shown
      this.checkTreasures();
    } catch (error) {
      console.error('TreasureHunt: Failed to initialize', error);
    }
  }

  startTimeTracking() {
    setInterval(() => {
      this.timeSpent++;
      this.checkTreasures();
    }, 1000);
  }

  checkTreasures() {
    const currentPath = window.location.pathname;

    this.treasures.forEach(treasure => {
      // Skip if already claimed
      if (localStorage.getItem(`claimed-${treasure.id}`)) return;

      // Check if treasure should be shown on this page
      if (!treasure.targetPages.some(page => currentPath.includes(page))) return;

      // Check time requirement
      if (treasure.timeToShow && this.timeSpent < treasure.timeToShow) return;

      // Check page views requirement
      if (treasure.pageViews && this.pageViews < treasure.pageViews) return;

      // Show the treasure
      this.showTreasure(treasure);
    });
  }

  showTreasure(treasure) {
    // Create treasure hunt modal
    const modal = document.createElement('div');
    modal.className = 'treasure-hunt-modal';
    modal.innerHTML = \`
      <div class="treasure-hunt-content">
        <h2>🎉 You found a treasure!</h2>
        <p>\${treasure.name}</p>
        <form id="treasure-claim-form-\${treasure.id}">
          <input type="email" placeholder="Your email" required>
          <input type="text" placeholder="Your name">
          <button type="submit">Claim Reward</button>
        </form>
      </div>
    \`;

    // Add styles
    const styles = document.createElement('style');
    styles.textContent = \`
      .treasure-hunt-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
      }
      .treasure-hunt-content {
        background: white;
        padding: 2rem;
        border-radius: 8px;
        max-width: 400px;
        width: 90%;
        text-align: center;
      }
      .treasure-hunt-content input {
        display: block;
        width: 100%;
        margin: 1rem 0;
        padding: 0.5rem;
        border: 1px solid #ddd;
        border-radius: 4px;
      }
      .treasure-hunt-content button {
        background: #000;
        color: white;
        border: none;
        padding: 0.5rem 1rem;
        border-radius: 4px;
        cursor: pointer;
      }
    \`;

    document.head.appendChild(styles);
    document.body.appendChild(modal);

    // Handle form submission
    const form = document.getElementById(`treasure-claim-form-${treasure.id}`);
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const email = form.querySelector('input[type="email"]').value;
      const name = form.querySelector('input[type="text"]').value;

      try {
        const response = await fetch('/api/treasures', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            treasureId: treasure.id,
            email,
            name,
          }),
        });

        const data = await response.json();
        
        if (data.error) {
          alert(data.error);
          return;
        }

        // Mark as claimed
        localStorage.setItem(`claimed-${treasure.id}`, 'true');
        
        // Show success message
        modal.querySelector('.treasure-hunt-content').innerHTML = \`
          <h2>🎉 Congratulations!</h2>
          <p>Your reward: \${JSON.stringify(data.reward)}</p>
        \`;

        // Remove modal after delay
        setTimeout(() => {
          modal.remove();
        }, 5000);
      } catch (error) {
        console.error('Failed to claim treasure:', error);
        alert('Failed to claim treasure. Please try again.');
      }
    });
  }
}

// Initialize treasure hunt when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const shopDomain = window.Shopify?.shop || document.querySelector('meta[name="shopify-shop-domain"]')?.content;
  if (shopDomain) {
    window.treasureHunt = new TreasureHunt(shopDomain);
    window.treasureHunt.initialize();
  }
});
