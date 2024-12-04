class TreasureHunt {
  constructor() {
    this.container = document.querySelector('.treasure-hunt');
    if (!this.container) return;

    this.shopDomain = this.container.dataset.shopDomain;
    this.pageViews = parseInt(localStorage.getItem('treasureHuntPageViews') || '0');
    this.timeSpent = 0;
    this.treasures = [];
    this.initialized = false;

    // Increment page views
    this.pageViews++;
    localStorage.setItem('treasureHuntPageViews', this.pageViews.toString());

    // Initialize UI elements
    this.title = this.container.querySelector('.treasure-hunt-title');
    this.message = this.container.querySelector('.treasure-hunt-message');
    this.form = this.container.querySelector('.treasure-hunt-form');
    this.successDiv = this.container.querySelector('.treasure-hunt-success');
    this.successMessage = this.container.querySelector('.success-message');

    // Bind event listeners
    this.container.querySelector('.treasure-hunt-close').addEventListener('click', () => this.hide());
    this.form.addEventListener('submit', (e) => this.handleClaim(e));

    // Initialize
    this.initialize();
  }

  async initialize() {
    if (this.initialized) return;
    
    try {
      // Fetch treasures for this shop
      const response = await fetch(`/apps/treasure/api/treasures?shop=${this.shopDomain}`);
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
    this.currentTreasure = treasure;
    this.title.textContent = '🎉 You found a treasure!';
    this.message.textContent = treasure.name;
    this.form.style.display = 'block';
    this.successDiv.style.display = 'none';
    this.container.style.display = 'flex';
    
    // Add active class after a small delay to trigger animation
    requestAnimationFrame(() => {
      this.container.classList.add('active');
    });
  }

  hide() {
    this.container.classList.remove('active');
    setTimeout(() => {
      this.container.style.display = 'none';
    }, 300);
  }

  async handleClaim(event) {
    event.preventDefault();
    
    const email = this.form.querySelector('.treasure-hunt-email').value;
    const name = this.form.querySelector('.treasure-hunt-name').value;

    try {
      const response = await fetch('/apps/treasure/api/treasures', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          treasureId: this.currentTreasure.id,
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
      localStorage.setItem(`claimed-${this.currentTreasure.id}`, 'true');
      
      // Show success message
      this.form.style.display = 'none';
      this.successDiv.style.display = 'block';
      this.successMessage.textContent = `Congratulations! ${data.reward.message || 'You\'ve claimed your reward!'}`;

      // Hide after delay
      setTimeout(() => this.hide(), 5000);
    } catch (error) {
      console.error('Failed to claim treasure:', error);
      alert('Failed to claim treasure. Please try again.');
    }
  }
}

// Initialize treasure hunt when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new TreasureHunt();
});
