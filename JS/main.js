const myTodos = [];
const RENDER_EVENT = "render-todo";

// Ketika halaman sudah dimuat dan tampil dengan baik
document.addEventListener("DOMContentLoaded", function () {
  const Form = document.getElementById("form");
  // Ketika Form di kirim
  Form.addEventListener("submit", function (event) {
    // Mencegah agar halaman tidak dimuat ulang
    event.preventDefault();

    // panggil fungsi addTodo() untuk menambahkan todo
    addTodo();
  });

  // Mengecek apakah storage didukung oleh browser
  if (isStorageExist()) {
    // Jika didukung jalankan fungsi berikut agar data tidak hilang ketika TODO APPS dibuka kembali
    loadDataFromStorage();
  }
});

// Fungsi untuk menambahkan todo
function addTodo() {
  const todoTitle = document.getElementById("title").value;
  const todoDesc = document.getElementById("description").value;
  const timestamp = document.getElementById("date").value;

  const generatedID = generatedId();
  const todoObject = generatedTodoObject(generatedID, todoTitle, todoDesc, timestamp, false);

  // Menyimpan todoObject pada array myTodos
  myTodos.push(todoObject);

  // Tampilan data pada halaman
  document.dispatchEvent(new Event(RENDER_EVENT));

  // Simpan data di local storage
  saveData();
}

// Membuat id unik berdasarkan waktu saat ini
function generatedId() {
  return +new Date();
}

function generatedTodoObject(id, task, desc, timestamp, isComplete) {
  return {
    id,
    task,
    desc,
    timestamp,
    isComplete,
  };
}

// Memperbarui tampilan data todo list berdasarkan statusnya(sudah di lakukan atau belum di lakukan)
document.addEventListener(RENDER_EVENT, function () {
  const uncompletedTODOList = document.getElementById("todos");
  const completedTODOList = document.getElementById("completed-todos");

  // Memastikan container dari todo list tersebut bersih/kosong sebelum diperbarui
  uncompletedTODOList.innerHTML = "";
  completedTODOList.innerHTML = "";

  // Meng-iterasi semua item dalam array myTodos
  for (const todoItem of myTodos) {
    const todoElement = makeTodo(todoItem);

    // Mengecek apakah todo belum di lakukan
    if (!todoItem.isComplete) {
      // Jika belum di lakukan tambahkan element ke div todos
      uncompletedTODOList.append(todoElement);
    }
    // Jika sudah di lakukan
    else {
      // Tambahkan element ke div completed-todos
      completedTODOList.append(todoElement);
    }
  }
});

// Membuat tampilan data todo list
function makeTodo(todoObject) {
  const textTitle = document.createElement("h2");
  textTitle.innerText = todoObject.task;

  const textDesc = document.createElement("p");
  textDesc.innerText = todoObject.desc;

  const textTimestamp = document.createElement("p");
  textTimestamp.innerText = todoObject.timestamp;

  const textContainer = document.createElement("div");
  textContainer.classList.add("inner");
  textContainer.append(textTitle, textDesc, textTimestamp);

  const container = document.createElement("div");
  container.classList.add("item");
  container.append(textContainer);

  // Memberikan id pada setiap todo item.
  container.setAttribute("id", `todo-${todoObject.id}`);

  // Mengecek apakah todo sudah di lakukan
  if (todoObject.isComplete) {
    // Tombol undo
    const undoButton = document.createElement("i");
    undoButton.classList.add("fa-solid", "fa-rotate-left", "undo-button");

    // Jika tombol undo di klik
    undoButton.addEventListener("click", function () {
      // Jalankan fungsi tersebut untuk memindahkan todo dari sudah di lakukan ke belum di lakukan
      undoTaskFromCompleted(todoObject.id);
    });

    // Tombol hapus
    const trashButton = document.createElement("i");
    trashButton.classList.add("fa-solid", "fa-trash", "trash-button");

    // Jika tombol hapus di klik
    trashButton.addEventListener("click", function () {
      // Jalankan fungsi tersebut untuk menghapus data
      removeTaskFromCompleted(todoObject.id);
    });

    // Tambahkan element pada container
    container.append(undoButton, trashButton);
  }
  // Jika belum di lakukan
  else {
    // Tombol check
    const checkButton = document.createElement("i");
    checkButton.classList.add("fa-solid", "fa-circle-check", "check-button");

    // Jika tombol check di klik
    checkButton.addEventListener("click", function () {
      // Jalankan fungsi tersebut untuk memindahkan data dari belum di lakukan ke sudah di lakukan
      addTaskToCompleted(todoObject.id);
    });

    // Tambahkan element pada container
    container.append(checkButton);
  }

  return container;
}

const SAVED_EVENT = "saved-todo";
const STORAGE_KEY = "TODO_APPS_KEY";

// Fungsi untuk menyimpan data ke local storage
function saveData() {
  // Mengecek apakah storage di dukung oleh browser
  if (isStorageExist()) {
    // Konversi data object javascript ke string JSON
    const parsed = JSON.stringify(myTodos);
    // Menyimpan data ke local storage
    localStorage.setItem(STORAGE_KEY, parsed);

    // Menampilkan perubahan data di konsol
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

// Fungsi untuk mengecek apakah Storage di dukung oleh browser atau tidak
function isStorageExist() {
  // Mengecek apakah Storage di dukung oleh browser
  if (typeof Storage === undefined) {
    // Tampilkan pesan jika tidak di dukung
    alert("Browser kamu tidak mendukung local storage :(");

    // kembalikan false
    return false;
  }

  // Kembalikan true jika di dukung
  return true;
}

// Costum Event untuk menampilkan perubahan data
document.addEventListener(SAVED_EVENT, function () {
  // Tampilkan perubahan data di konsol
  localStorage.getItem(STORAGE_KEY);
});

// Menambahkan data dari belum di lakukan ke sudah di lakukan
function addTaskToCompleted(todoId) {
  // Mendapatkan todos dengan id yang sesuai
  const todoTarget = findTodo(todoId);

  // Jika tidak menemukan id yang sesuai, fungsi akan berhenti/keluar
  if (todoTarget === null) return;

  // Menandai todo sebagai selesai di lakukan
  todoTarget.isComplete = true;

  // Perbarui tampilan data
  document.dispatchEvent(new Event(RENDER_EVENT));

  // Menyimpan data
  saveData();
}

// Fungsi untuk mencari id todo yang sesuai pada array myTodos
function findTodo(todoId) {
  // Memeriksa setiap todo pada array myTodos
  for (const todoItem of myTodos) {
    // Apakah ada id yang sama/sesuai
    if (todoItem.id === todoId) {
      // Jika ada kembalikan todoItem
      return todoItem;
    }
  }

  // Menghentikan / Mengeluarkan fungsi jika sudah selesai diperiksa
  return null;
}

// Fungsi mengembalikan data dari sudah dilakukan ke belum dilakukan
function undoTaskFromCompleted(todoId) {
  // Mendapatkan todo dengan id yang sesuai
  const todoTarget = findTodo(todoId);

  // Jika tidak menemukan todo dengan id yang sesuai, hentikan/keluarkan fungsi
  if (todoTarget === null) return;

  // Menandai todo sebagai belum dilakukan
  todoTarget.isComplete = false;

  // Perbarui tampilan data
  document.dispatchEvent(new Event(RENDER_EVENT));

  // Menyimpan data
  saveData();
}

// Fungsi menghapus data dari local storage
function removeTaskFromCompleted(todoId) {
  // Mendapatkan index todo yang sesuai
  const todoTarget = findTodoIndex(todoId);

  // Jika tidak menemukan index dengan id yang sesuai, keluarkan/hentikan fungsi
  if (todoTarget.id === -1) return;

  // Menghapus todo
  myTodos.splice(todoTarget, 1);

  // Perbarui tampilan data
  document.dispatchEvent(new Event(RENDER_EVENT));

  // Menyimpan data
  saveData();
}

// Fungsi untuk mencari index todo yang sesuai
function findTodoIndex(todoId) {
  for (const index in myTodos) {
    // Mengecek apakah ada index dengan id yang sama/sesuai pada array myTodos
    if (myTodos[index].id === todoId) {
      // Jika ada kembalikan index
      return index;
    }
  }

  // Mengembalikan -1 jika ada index dengan id yang sesuai pada array myTodos
  return -1;
}

// Fungsi untuk memuat data ketika TODO APPS dibuka kembali
function loadDataFromStorage() {
  // Mengambil data pada local storage
  const getData = localStorage.getItem(STORAGE_KEY);

  // Meng-konversi data dari string JSON ke object javascript
  const myData = JSON.parse(getData);

  // Mengecek apa data ada
  if (myData !== null) {
    for (const todo of myData) {
      // Masukan data pada array myTodos
      myTodos.push(todo);
    }
  }

  // Perbarui tampilan data
  document.dispatchEvent(new Event(RENDER_EVENT));
}
