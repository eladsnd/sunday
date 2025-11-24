// Monday.com Clone - Interactive Features

document.addEventListener('DOMContentLoaded', () => {
    initializeGroupToggle();
    initializeAddItemButtons();
    initializeStatusDropdown();
    initializeCheckboxes();
    initializeItemNameEditing();
});

// ====================================
// Group Collapse/Expand
// ====================================

function initializeGroupToggle() {
    const groups = document.querySelectorAll('.group');
    
    groups.forEach(group => {
        const header = group.querySelector('.group-header');
        
        header.addEventListener('click', (e) => {
            // Don't toggle if clicking the add item button
            if (e.target.closest('.add-item-btn')) return;
            
            group.classList.toggle('collapsed');
            updateItemCount(group);
        });
    });
}

function updateItemCount(group) {
    const items = group.querySelectorAll('.item-row');
    const countEl = group.querySelector('.item-count');
    if (countEl) {
        countEl.textContent = `${items.length} items`;
    }
}

// ====================================
// Add New Item
// ====================================

function initializeAddItemButtons() {
    const addButtons = document.querySelectorAll('.add-item-btn');
    
    addButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent group toggle
            const group = button.closest('.group');
            addNewItem(group);
        });
    });
}

function addNewItem(group) {
    const groupItems = group.querySelector('.group-items');
    
    // Create new item row
    const newRow = document.createElement('div');
    newRow.className = 'item-row';
    newRow.innerHTML = `
        <div class="cell col-checkbox">
            <input type="checkbox" class="item-checkbox">
        </div>
        <div class="cell col-item">
            <span class="item-name" contenteditable="true">New task</span>
        </div>
        <div class="cell col-person">
            <div class="person-avatars">
                <div class="avatar avatar-sm" style="background: #60A5FA;">--</div>
            </div>
        </div>
        <div class="cell col-status">
            <div class="status-badge status-todo" data-status="todo">
                <span>Not started</span>
            </div>
        </div>
        <div class="cell col-date">
            <span class="date-text">--</span>
        </div>
        <div class="cell col-timeline">
            <div class="timeline-bar" style="width: 0%; background: #C4C4C4;"></div>
        </div>
    `;
    
    // Add to group
    groupItems.appendChild(newRow);
    
    // Initialize functionality for new item
    const checkbox = newRow.querySelector('.item-checkbox');
    checkbox.addEventListener('change', handleCheckboxChange);
    
    const statusBadge = newRow.querySelector('.status-badge');
    statusBadge.addEventListener('click', handleStatusClick);
    
    const itemName = newRow.querySelector('.item-name');
    itemName.addEventListener('blur', handleItemNameBlur);
    
    // Focus on new item name
    itemName.focus();
    selectAllText(itemName);
    
    // Update item count
    updateItemCount(group);
    
    // Animate in
    newRow.style.opacity = '0';
    newRow.style.transform = 'translateY(-10px)';
    setTimeout(() => {
        newRow.style.transition = 'all 0.3s ease';
        newRow.style.opacity = '1';
        newRow.style.transform = 'translateY(0)';
    }, 10);
}

// ====================================
// Status Dropdown
// ====================================

let currentStatusBadge = null;

function initializeStatusDropdown() {
    const statusBadges = document.querySelectorAll('.status-badge');
    const dropdown = document.getElementById('statusDropdown');
    
    statusBadges.forEach(badge => {
        badge.addEventListener('click', handleStatusClick);
    });
    
    // Dropdown item clicks
    const dropdownItems = dropdown.querySelectorAll('.dropdown-item');
    dropdownItems.forEach(item => {
        item.addEventListener('click', () => {
            const newStatus = item.dataset.status;
            if (currentStatusBadge) {
                updateStatusBadge(currentStatusBadge, newStatus);
            }
            hideStatusDropdown();
        });
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.status-badge') && !e.target.closest('.status-dropdown')) {
            hideStatusDropdown();
        }
    });
}

function handleStatusClick(e) {
    e.stopPropagation();
    const badge = e.currentTarget;
    currentStatusBadge = badge;
    showStatusDropdown(badge);
}

function showStatusDropdown(badge) {
    const dropdown = document.getElementById('statusDropdown');
    const rect = badge.getBoundingClientRect();
    
    dropdown.style.display = 'block';
    dropdown.style.left = rect.left + 'px';
    dropdown.style.top = (rect.bottom + 8) + 'px';
    
    // Animate in
    dropdown.style.opacity = '0';
    dropdown.style.transform = 'translateY(-10px)';
    setTimeout(() => {
        dropdown.style.transition = 'all 0.2s ease';
        dropdown.style.opacity = '1';
        dropdown.style.transform = 'translateY(0)';
    }, 10);
}

function hideStatusDropdown() {
    const dropdown = document.getElementById('statusDropdown');
    dropdown.style.display = 'none';
    currentStatusBadge = null;
}

function updateStatusBadge(badge, status) {
    // Remove all status classes
    badge.classList.remove('status-working', 'status-stuck', 'status-done', 'status-todo');
    
    // Add new status class
    badge.classList.add(`status-${status}`);
    badge.dataset.status = status;
    
    // Update text
    const statusTexts = {
        working: 'Working on it',
        stuck: 'Stuck',
        done: 'Done',
        todo: 'Not started'
    };
    badge.querySelector('span').textContent = statusTexts[status];
    
    // Update timeline bar color if status is done
    const row = badge.closest('.item-row');
    const timelineBar = row.querySelector('.timeline-bar');
    if (status === 'done') {
        timelineBar.style.width = '100%';
        timelineBar.style.background = '#00C875';
    }
}

// ====================================
// Checkbox Functionality
// ====================================

function initializeCheckboxes() {
    const checkboxes = document.querySelectorAll('.item-checkbox');
    
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', handleCheckboxChange);
    });
}

function handleCheckboxChange(e) {
    const checkbox = e.target;
    const row = checkbox.closest('.item-row');
    const itemName = row.querySelector('.item-name');
    const statusBadge = row.querySelector('.status-badge');
    
    if (checkbox.checked) {
        itemName.classList.add('completed');
        updateStatusBadge(statusBadge, 'done');
    } else {
        itemName.classList.remove('completed');
        updateStatusBadge(statusBadge, 'todo');
    }
}

// ====================================
// Item Name Editing
// ====================================

function initializeItemNameEditing() {
    const itemNames = document.querySelectorAll('.item-name');
    
    itemNames.forEach(itemName => {
        itemName.addEventListener('focus', (e) => {
            selectAllText(e.target);
        });
        
        itemName.addEventListener('blur', handleItemNameBlur);
        
        itemName.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                e.target.blur();
            }
            if (e.key === 'Escape') {
                e.preventDefault();
                e.target.blur();
            }
        });
    });
}

function handleItemNameBlur(e) {
    const itemName = e.target;
    if (itemName.textContent.trim() === '') {
        itemName.textContent = 'Untitled';
    }
}

function selectAllText(element) {
    const range = document.createRange();
    range.selectNodeContents(element);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
}

// ====================================
// Keyboard Shortcuts (Optional Enhancement)
// ====================================

document.addEventListener('keydown', (e) => {
    // Cmd/Ctrl + K to focus search
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.querySelector('.search-box input');
        searchInput?.focus();
    }
});

// ====================================
// Smooth Animations on Load
// ====================================

window.addEventListener('load', () => {
    const groups = document.querySelectorAll('.group');
    groups.forEach((group, index) => {
        group.style.opacity = '0';
        group.style.transform = 'translateY(20px)';
        setTimeout(() => {
            group.style.transition = 'all 0.4s ease';
            group.style.opacity = '1';
            group.style.transform = 'translateY(0)';
        }, index * 100);
    });
});

// ====================================
// Person Avatar Click (Placeholder)
// ====================================

document.addEventListener('click', (e) => {
    if (e.target.closest('.person-avatars')) {
        // Placeholder for person assignment dropdown
        console.log('Person avatar clicked - dropdown could be implemented here');
    }
    
    if (e.target.closest('.date-text')) {
        // Placeholder for date picker
        console.log('Date clicked - date picker could be implemented here');
    }
});
