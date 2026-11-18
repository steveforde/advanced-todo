// 1. Select elements
const taskInput = document.getElementById("task-input");
const dateInput = document.getElementById("date-input");
const priorityInput = document.getElementById("priority-input");
const addBtn = document.getElementById("add-btn");
const todoList = document.getElementById("todo-list");
const emptyState = document.getElementById("empty-state"); // NEW

const filterAll = document.getElementById("filter-all");
const filterActive = document.getElementById("filter-active");
const filterCompleted = document.getElementById("filter-completed");
const sortBtn = document.getElementById("sort-btn");
const clearBtn = document.getElementById("clear-btn");

// 2. Load Tasks on Startup
document.addEventListener("DOMContentLoaded", () => {
  const storedTasks = JSON.parse(localStorage.getItem("tasks")) || [];
  storedTasks.forEach((task) => {
    createTaskElement(task.text, task.date, task.priority, task.completed);
  });
  checkEmpty(); // NEW: Check if empty on load
});

// 3. Add a Task
function addTask(e) {
  e.preventDefault();

  const text = taskInput.value;
  const date = dateInput.value;
  const priority = priorityInput.value;

  if (text === "") {
    alert("Please enter a task!");
    return;
  }

  createTaskElement(text, date, priority, false);
  updateLocalStorage();
  checkEmpty(); // NEW: Check if empty after adding

  taskInput.value = "";
  dateInput.value = "";
}

// 4. Create the HTML
function createTaskElement(text, date, priority, completed) {
  const li = document.createElement("li");
  li.classList.add("todo-item");

  if (completed) {
    li.classList.add("completed");
  }

  li.innerHTML = `
        <div class="task-content">
            <span class="task-text">${text}</span>
            <span class="task-date">${date}</span>
        </div>
        
        <div class="task-actions">
            <span class="badge badge-${priority}">${priority}</span>
            <button class="edit-btn"><i class="fas fa-edit"></i></button>
            <button class="delete-btn"><i class="fas fa-trash"></i></button>
        </div>
    `;

  todoList.appendChild(li);
}

// 5. Handle Clicks (Delete, Edit, Check Off)
todoList.addEventListener("click", function (e) {
  const item = e.target;
  const li = item.closest("li");

  if (!li) return;

  // A. DELETE LOGIC (With Animation)
  if (item.closest(".delete-btn")) {
    if (confirm("Delete this task?")) {
      li.classList.add("fall"); // 1. Add Animation Class

      // 2. Wait for animation to finish
      li.addEventListener("transitionend", function () {
        li.remove(); // 3. Remove from HTML
        updateLocalStorage();
        checkEmpty(); // 4. Check if empty
      });
    }
    return;
  }

  // B. EDIT LOGIC
  if (item.closest(".edit-btn")) {
    const taskContent = li.querySelector(".task-content");
    const textSpan = li.querySelector(".task-text");
    const dateSpan = li.querySelector(".task-date");
    const editBtnIcon = li.querySelector(".edit-btn i");

    if (li.classList.contains("editing")) {
      const newText = li.querySelector(".text-input").value;
      const newDate = li.querySelector(".date-input").value;

      taskContent.innerHTML = `
                <span class="task-text">${newText}</span>
                <span class="task-date">${newDate}</span>
            `;

      editBtnIcon.classList.remove("fa-save");
      editBtnIcon.classList.add("fa-edit");
      li.classList.remove("editing");

      updateLocalStorage();
    } else {
      const currentText = textSpan.innerText;
      const currentDate = dateSpan.innerText;

      taskContent.innerHTML = `
                <input type="text" class="edit-mode-input text-input" value="${currentText}">
                <input type="date" class="edit-mode-input date-input" value="${currentDate}">
            `;

      editBtnIcon.classList.remove("fa-edit");
      editBtnIcon.classList.add("fa-save");
      li.classList.add("editing");
    }
    return;
  }

  // C. CHECK OFF LOGIC
  if (!li.classList.contains("editing")) {
    li.classList.toggle("completed");
    updateLocalStorage();
  }
});

// 6. Check Empty State Function (NEW)
function checkEmpty() {
  if (todoList.children.length === 0) {
    emptyState.style.display = "block";
  } else {
    emptyState.style.display = "none";
  }
}

// 7. Save to Local Storage
function updateLocalStorage() {
  const tasks = [];
  document.querySelectorAll(".todo-item").forEach((li) => {
    // Handle saving correctly even if currently in edit mode
    let textVal, dateVal;

    if (li.classList.contains("editing")) {
      textVal = li.querySelector(".text-input").value;
      dateVal = li.querySelector(".date-input").value;
    } else {
      textVal = li.querySelector(".task-text").innerText;
      dateVal = li.querySelector(".task-date").innerText;
    }

    tasks.push({
      text: textVal,
      date: dateVal,
      priority: li.querySelector(".badge").innerText.toLowerCase(),
      completed: li.classList.contains("completed"),
    });
  });

  localStorage.setItem("tasks", JSON.stringify(tasks));
}

// 8. Filters
function filterTasks(category) {
  const allButtons = document.querySelectorAll(".filter-buttons button");
  allButtons.forEach((btn) => btn.classList.remove("active"));

  if (category === "all") filterAll.classList.add("active");
  if (category === "active") filterActive.classList.add("active");
  if (category === "completed") filterCompleted.classList.add("active");

  const items = document.querySelectorAll(".todo-item");

  items.forEach((item) => {
    const isCompleted = item.classList.contains("completed");
    switch (category) {
      case "all":
        item.style.display = "flex";
        break;
      case "active":
        item.style.display = isCompleted ? "none" : "flex";
        break;
      case "completed":
        item.style.display = isCompleted ? "flex" : "none";
        break;
    }
  });
}

// 9. Sort & Clear
sortBtn.addEventListener("click", () => {
  const itemsArray = Array.from(todoList.children);
  itemsArray.sort((a, b) => {
    const dateA = a.querySelector(".task-date")
      ? a.querySelector(".task-date").innerText
      : "";
    const dateB = b.querySelector(".task-date")
      ? b.querySelector(".task-date").innerText
      : "";
    if (dateA === "") return 1;
    if (dateB === "") return -1;
    return dateA.localeCompare(dateB);
  });
  itemsArray.forEach((item) => todoList.appendChild(item));
  updateLocalStorage();
});

clearBtn.addEventListener("click", () => {
  if (confirm("Delete all completed?")) {
    const completedItems = document.querySelectorAll(".todo-item.completed");
    completedItems.forEach((item) => {
      // Add animation to these too!
      item.classList.add("fall");
      item.addEventListener("transitionend", () => {
        item.remove();
        updateLocalStorage();
        checkEmpty(); // Check after clearing
      });
    });
  }
});

// 10. Listeners
addBtn.addEventListener("click", addTask);
filterAll.addEventListener("click", () => filterTasks("all"));
filterActive.addEventListener("click", () => filterTasks("active"));
filterCompleted.addEventListener("click", () => filterTasks("completed"));
taskInput.addEventListener("keypress", function (e) {
  if (e.key === "Enter") addTask(e);
});
