// ===== HOMEPAGE SEARCH REDIRECT FUNCTION =====
function performSearch() {
  const query = document.getElementById('searchInput').value.trim();
  if (query.length > 0) {
    window.location.href = `resources.html?q=${encodeURIComponent(query)}`;
  } else {
    alert('Please enter a search term.');
  }
}

// ===== ACCORDION TOGGLE FUNCTION (used on resources.html and faq.html) =====
// Expands/collapses a content section and swaps the +/- icon
function toggleAccordion(id) {
  const content = document.getElementById(id);
  const icon = document.getElementById(`icon-${id}`);

  if (content.style.display === 'block') {
    content.style.display = 'none';
    if (icon) icon.textContent = '+';
  } else {
    content.style.display = 'block';
    if (icon) icon.textContent = '-';
  }
}

// ===== RESOURCE SEARCH FILTER (used on resources.html) =====
// Filters visible resource entries based on keywords typed in the search box
function filterResources() {
  const input = document.getElementById('resourceSearchInput');
  if (!input) return;

  const query = input.value.trim().toLowerCase();
  const entries = document.querySelectorAll('.resource-entry');
  let matchCount = 0;

  entries.forEach(entry => {
    const keywords = entry.getAttribute('data-keywords').toLowerCase();
    const text = entry.textContent.toLowerCase();

    if (query === '' || keywords.includes(query) || text.includes(query)) {
      entry.style.display = 'block';
      matchCount++;

      // Auto-expand the parent accordion section if there's a match and a query was typed
      if (query !== '') {
        const parentContent = entry.closest('.accordion-content');
        if (parentContent) parentContent.style.display = 'block';
      }
    } else {
      entry.style.display = 'none';
    }
  });

  const noResultsMsg = document.getElementById('noResultsMsg');
  if (noResultsMsg) {
    noResultsMsg.style.display = matchCount === 0 ? 'block' : 'none';
  }
}

// ===== AUTO-FILL SEARCH BOX FROM HOMEPAGE QUERY PARAMETER =====
// If a user searched from the homepage, this carries their search term into the resources page
document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const query = params.get('q');
  const resourceSearchInput = document.getElementById('resourceSearchInput');

  if (query && resourceSearchInput) {
    resourceSearchInput.value = query;
    filterResources();
  }

  // Allow "Enter" key to trigger homepage search
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('keypress', (event) => {
      if (event.key === 'Enter') performSearch();
    });
  }

  // Initialize progress tracker checklists if on tracker.html
  if (document.getElementById('checklist-3level')) {
    initializeTracker();
  }
});

// ===== PROGRESS TRACKER LOGIC (used on tracker.html) =====

// Define the checklist items for each skill level
// Feel free to customize these task names for your specific AFSC
const checklistData = {
  '3level': [
    'Complete Safety Orientation',
    'Finish CDC Volume 1',
    'Complete First OJT Task Signoff',
    'Pass Initial Knowledge Check'
  ],
  '5level': [
    'Complete CDC Volume 1',
    'Complete CDC Volume 2',
    'Complete CDC Volume 3',
    'Pass EOC Practice Test',
    'Complete Task Qualification List (TQL)',
    'Schedule EOC Exam'
  ],
  '7level': [
    'Complete Advanced Task References',
    'Complete Leadership Module',
    'Shadow a Supervisory Task',
    'Pass 7-Level Knowledge Test'
  ]
};

// Builds the checklist UI dynamically and restores saved progress from localStorage
function initializeTracker() {
  Object.keys(checklistData).forEach(level => {
    const container = document.getElementById(`checklist-${level}`);
    if (!container) return;

    checklistData[level].forEach((task, index) => {
      const itemId = `${level}-task-${index}`;
      const isChecked = localStorage.getItem(itemId) === 'true';

      const wrapper = document.createElement('div');
      wrapper.className = 'checklist-item';
      wrapper.innerHTML = `
        <input type="checkbox" id="${itemId}" ${isChecked ? 'checked' : ''} onchange="handleCheck('${itemId}')" />
        <label for="${itemId}">${task}</label>
      `;
      container.appendChild(wrapper);
    });
  });

  updateProgressBar();
}

// Saves checkbox state to localStorage whenever a user checks/unchecks an item
function handleCheck(itemId) {
  const checkbox = document.getElementById(itemId);
  localStorage.setItem(itemId, checkbox.checked);
  updateProgressBar();
}

// Calculates and updates the overall progress percentage and bar width
function updateProgressBar() {
  let total = 0;
  let completed = 0;

  Object.keys(checklistData).forEach(level => {
    checklistData[level].forEach((task, index) => {
      total++;
      if (localStorage.getItem(`${level}-task-${index}`) === 'true') {
        completed++;
      }
    });
  });

  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  const percentLabel = document.getElementById('progressPercent');
  const progressBar = document.getElementById('progressBarInner');

  if (percentLabel) percentLabel.textContent = `${percent}%`;
  if (progressBar) progressBar.style.width = `${percent}%`;
}

// Clears all saved progress from localStorage and refreshes the page
function resetProgress() {
  const confirmReset = confirm('Are you sure you want to reset all progress? This cannot be undone.');
  if (confirmReset) {
    Object.keys(checklistData).forEach(level => {
      checklistData[level].forEach((task, index) => {
        localStorage.removeItem(`${level}-task-${index}`);
      });
    });
    location.reload();
  }
}