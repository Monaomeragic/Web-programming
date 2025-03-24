function getUser() {
    return JSON.parse(localStorage.getItem('loggedInUser'));
}

function detectSubjectFromHash() {
    const hash = window.location.hash;
    if (!hash.includes("-materials")) return null;

    const subjectMap = {
        "math": "Mathematics",
        "physics": "Physics",
        "computer-science": "Computer Science",
        "chemistry": "Chemistry"
    };

    for (let key in subjectMap) {
        if (hash.includes(key)) {
            return subjectMap[key];
        }
    }
    return null;
}

$(document).ready(function () {
  console.log("Document is ready"); // Verify that jQuery is initialized properly
  // Profile photo upload handling
  $('#newUserPhoto').on('change', function() {
      const fileInput = this;
      if (fileInput.files && fileInput.files[0]) {
          const reader = new FileReader();
          reader.onload = function(e) {
              const imgData = e.target.result;
              localStorage.setItem('profilePhoto', imgData);
              $('#displayPhoto').attr('src', imgData);
          };
          reader.readAsDataURL(fileInput.files[0]);
      }
  });
  
  // Display stored profile photo on page load
  const storedImage = localStorage.getItem('profilePhoto');
  if (storedImage) {
      $('#displayPhoto').attr('src', storedImage);
  }
  function getSubjectFromHash(hash) {
      let page = hash.replace("#", "").replace("-materials", "").replace(/-/g, " ");
      return page.charAt(0).toUpperCase() + page.slice(1);
  }
  // Materials page will be loaded based on URL hash in a later block
  // Initialize materials in localStorage if not present
  if (!localStorage.getItem("materials")) {
      localStorage.setItem("materials", JSON.stringify([]));
  }

  let app = $.spapp({ pageNotFound: 'error_404' }); // Initialize SPApp

  let users = JSON.parse(localStorage.getItem("users")) || [];
  if (!users.find(u => u.email === "admin@admin.com")) {
    users.push({ name: "Admin", email: "admin@admin.com", password: "admin123", role: "admin", subjects: [] });
    localStorage.setItem("users", JSON.stringify(users));
  }
  
  // DEV ONLY: Reset users if needed
  // Uncomment to clear and reset user list
  /*
  localStorage.removeItem("users");
  users = [];
  users.push({ name: "Prof. John Smith", email: "johnsmith@example.com", password: "123456", role: "professor" });
  users.push({ name: "Admin", email: "admin@admin.com", password: "admin123", role: "admin" });
  localStorage.setItem("users", JSON.stringify(users));
  */
  console.log("Current users:", users);

  // User-related functions
  function getUser() {
    return JSON.parse(localStorage.getItem("loggedInUser"));
  }

  function saveUser(user) {
    localStorage.setItem("loggedInUser", JSON.stringify(user));
  }

  function logout() {
    localStorage.removeItem("loggedInUser");
    window.location.hash = "#login";
  }

  function updateNavigation() {
    const user = getUser();

    if (user) {
        $("#navbar").show();  // Show navbar if a user is logged in
        $("#logoutButton").show().removeClass().addClass("btn btn-danger ms-3");
        $("#appTitle").html('Appointment System <span id="appRole" style="font-size: 16px; font-family: Georgia, serif; color: red;">for ' + capitalizeFirstLetter(user.role) + '</span>');

        // Set visibility of navbar elements based on user role
        $("#homeNav, #manageBookingsNav, #materialsDropdown").show();
        $("#editProfessorsNav, #adminAddNav, #adminEditNav").hide();

        // Hide "Live Sessions" link for admin specifically
        if (user.email === "admin@admin.com") {
            $("#liveSessionsNav").hide(); // Hide for admin
            addAdminNavigation(); // Show Admin-specific links (Add and Edit)
        } else {
            $("#liveSessionsNav").show(); // Show Live Sessions for professor and student
        }

        if (user.role === "admin") {
            // For admin, show only specific links and ensure Messages link is always hidden
            $("#homeNav, #manageBookingsNav, #materialsDropdown").hide();
            $("#messagesNav").hide(); // Hide Messages link for admin
        } else if (user.role === "professor") {
            // For professor, adjust visibility and ensure Messages link is hidden
            $("#homeNav").hide();
            $("#messagesNav").hide();
        } else if (user.role === "student") {
            // For student, show messages if available
            checkMessagesForStudent(user);
        }
    } else {
        $("#navbar").hide(); // Hide navbar if no user is logged in
        $("#logoutButton").hide(); // Hide logout button if no user is logged in
        $("#appTitle").text('Appointment System');  // Default title
    }
}

function addAdminNavigation() {
    if (!$("#adminAddNav").length) {
        $(".navbar-nav").append('<li class="nav-item" id="adminAddNav"><a class="nav-link" href="#manage-users">Add Professors/Assistants</a></li>');
    }
    if (!$("#adminEditNav").length) {
        $(".navbar-nav").append('<li class="nav-item" id="adminEditNav"><a class="nav-link" href="#edit-professors">Edit Professors/Assistants</a></li>');
    }
}

function checkMessagesForStudent(user) {
    // Ensure the Messages link is always visible for students
    $("#messagesNav").css('display', 'block');
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

  // Application routes
  app.route({ view: 'login', load: 'login.html', onReady: updateNavigation });
  app.route({ view: 'signup', load: 'signup.html', onReady: updateNavigation });
  app.route({ view: 'home', load: 'home.html', onReady: loadHome });
  app.route({ view: 'manage-bookings', load: 'manage-bookings.html', onReady: loadManageBookings });
  app.route({ view: 'booking', load: 'booking.html', onReady: loadBooking });
  app.route({ view: 'math-materials', load: 'math-materials.html', onReady: () => loadMaterialsPage("Mathematics") });
  app.route({ view: 'physics-materials', load: 'physics-materials.html', onReady: () => loadMaterialsPage("Physics") });
  app.route({ view: 'computer-science-materials', load: 'computer-science-materials.html', onReady: () => loadMaterialsPage("Computer Science") });
  app.route({ view: 'chemistry-materials', load: 'chemistry-materials.html', onReady: () => loadMaterialsPage("Chemistry") });
  app.route({ view: 'manage-users', load: 'manage-users.html', onReady: loadUserManagement });
  app.route({ view: 'edit-professors', load: 'edit-professors.html', onReady: loadEditProfessors });
  app.route({ view: 'messages', load: 'messages.html', onReady: function() { console.log('Messages page loaded.'); loadMessages(); } });
  app.route({ view: 'live-session', load: 'live-session.html', onReady: function() {
    console.log('Live Sessions page loaded.');
    const user = getUser();
    if (user && user.role === "professor") {
      const createForm = document.getElementById("createSessionForm");
      if (createForm) createForm.style.display = "block";
    } else {
      const createForm = document.getElementById("createSessionForm");
      if (createForm) createForm.style.display = "none";
    }
    setTimeout(() => {
      console.log("Calling displaySessions after delay");
      displaySessions();
    }, 50);
  }});
  

  function loadHome() {
    const user = getUser();
    if (!user) {
      window.location.hash = "#login";
      return;
    }
  
    updateNavigation();
  
    const container = $("#professorList");
    if (!container.length) return;
  
    container.empty();
  
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const staffList = users.filter(u => u.role === "professor" || u.role === "assistant");
  
    if (staffList.length === 0) {
      container.append("<p>No professors or assistants available at the moment.</p>");
      return;
    }
  
    // Dynamically extract all subjects from staffList
    const subjectSet = new Set();
    staffList.forEach(user => {
      (user.subjects || []).forEach(subject => subjectSet.add(subject));
    });
    
    subjectSet.forEach(subject => {
      const subjectStaff = staffList.filter(user => user.subjects && user.subjects.includes(subject));
      if (subjectStaff.length > 0) {
        const box = $(`
          <div class="subject-box mb-5 p-4 border rounded w-100 bg-light">
            <h3>${subject}</h3>
            <div class="staff-list d-flex flex-row flex-nowrap overflow-auto gap-3"></div>
          </div>
        `);
    
        subjectStaff.forEach(staff => {
          box.find(".staff-list").append(`
            <div class="user-card p-3 border rounded flex-shrink-0" style="width: 280px;">
              <p><strong>Name:</strong> ${staff.name}</p>
              <p><strong>Email:</strong> ${staff.email}</p>
              <p><strong>Role:</strong> ${staff.role}</p>
              <button class="btn btn-primary" onclick="goToBooking('${staff.name}', '${subject}')">Book</button>
            </div>
          `);
        });
    
        container.append(box);
      }
    });
  }

  function loadManageBookings() {
    const user = getUser();
    if (!user) {
      window.location.hash = "#login";
    } else {
      loadBookings(user);
      updateNavigation();
    }
  }

  function loadBooking() {
    if (!getUser()) {
      window.location.hash = "#login";
    } else {
      loadBookingPage();
      setTimeout(populateTimeDropdown, 0);
      updateNavigation();
    }
  }

  function loadMaterialsPage(subject) {
    setTimeout(() => {
        if (!subject || subject.trim() === "") {
            console.error("Error: Subject is undefined or empty!");
            alert("No subject detected. Please select a subject.");
            return;
        }
        console.log("Loading materials for:", subject);
        const user = getUser();
        const materialsContainerId = subject.toLowerCase().replace(/\s/g, '') + 'MaterialsContainer'; // Dynamically generate ID based on subject
        console.log("Materials container ID:", materialsContainerId); // Debugging line
        const materialsContainer = $("#" + materialsContainerId);

        if (!materialsContainer.length) {
            console.error("Error: #" + materialsContainerId + " not found in HTML.");
            return;
        }

        materialsContainer.empty();
        materialsContainer.append(`<h2>${subject} Materials</h2>`);

        let uploadedFiles = JSON.parse(localStorage.getItem("materials")) || [];
        console.log("All uploaded files:", JSON.stringify(uploadedFiles)); // Debugging line
        let subjectFiles = uploadedFiles.filter(file => file.subject === subject);
        console.log("Filtered files for subject:", JSON.stringify(subjectFiles)); // Debugging line

        if (subjectFiles.length === 0) {
            materialsContainer.append("<p>No materials uploaded yet.</p>");
        } else {
        subjectFiles.forEach((file, index) => {
                let deleteButton = "";
                if (user && user.role === "professor") {
                    deleteButton = `<button class="delete-material btn btn-danger" data-index="${index}">Delete</button>`;
                }
                let fileElement = file.url.startsWith("data:image")
                    ? `<img src="${file.url}" style="max-width: 100px;">`
                    : `<a href="${file.url}" target="_blank">${file.name}</a>`;
                materialsContainer.append(`
                    <div class="material-item">
                        ${fileElement}
                        ${deleteButton}
                    </div>
                `);
            });
        }

        if (user && user.role === "professor") {
            let uploadSection = `
                <div id="uploadSection">
                    <input type="file" id="uploadMaterial" />
                    <button id="uploadMaterialBtn" class="btn btn-primary">Upload Material</button>
                </div>
            `;
            materialsContainer.append(uploadSection);
        }
        console.log("Materials loaded for subject:", subject); // Debugging line
    }, 100);  // Delay to ensure the element is loaded
  }

  // Ensure materials page loads when accessed
  $(document).on("click", "#materialsDropdown a", function (e) {
    e.preventDefault();
    let subject = $(this).text().trim();
    console.log("Dropdown clicked. Subject selected:", subject);
    localStorage.setItem("selectedSubject", subject);
    console.log("Stored subject in localStorage:", localStorage.getItem("selectedSubject"));
    loadMaterialsPage(subject);
    window.location.hash = subject.toLowerCase().replace(/\s+/g, '-') + "-materials";
  });
  
 // Adjust the loadEditProfessors function to handle subject filtering
function loadEditProfessors() {
  const selectedSubject = $('#subjectFilter').val() || 'all'; // Ensure a default value of 'all' is used if nothing is selected
  const users = JSON.parse(localStorage.getItem('users')) || [];
  const container = $('#editProfessorsList');
  container.empty();
 
  let filteredUsers;
  if (selectedSubject === 'all') {
      filteredUsers = users.filter(user => user.role === 'professor' || user.role === 'assistant');
  } else {
      filteredUsers = users.filter(user => (user.subjects && user.subjects.includes(selectedSubject)) && (user.role === 'professor' || user.role === 'assistant'));
  }
 
  if (filteredUsers.length > 0) {
      filteredUsers.forEach(user => {
          container.append(`
              <div class="user-card">
                <p><strong>Name:</strong> ${user.name}</p>
                <p><strong>Email:</strong> <input class="edit-email form-control" type="email" value="${user.email}" disabled></p>
                <p><strong>Password:</strong> <input class="edit-password form-control" type="password" value="${user.password}" style="display: none;" disabled></p>
                <p><strong>Role:</strong> ${user.role}</p>
                <p><strong>Subjects:</strong> ${user.subjects ? user.subjects.join(', ') : ''}</p>
                <button class="edit-user btn btn-primary" data-email="${user.email}">Edit</button>
                <button class="delete-user btn btn-danger" data-email="${user.email}">Delete</button>
              </div>
          `);
      });
  } else {
      container.append('<p>No professors or assistants found for the selected subject.</p>');
  }
}

// Ensure the dropdown changes trigger the list update
  $(document).on("change", "#subjectFilter", function () {
    loadEditProfessors();
  });
  // Ensure selected subject is correctly retrieved before uploading
  $(document).on("click", "#uploadMaterialBtn", function () {
    console.log("Upload button clicked"); // Debugging
    const subject = localStorage.getItem("selectedSubject");
    console.log("Subject from localStorage:", subject);
 
    if (!subject || subject.trim() === "") {
      alert("No subject selected. Please select a subject from the dropdown.");
      return;
    }
 
    const fileInput = document.getElementById("uploadMaterial");
    if (!fileInput || fileInput.files.length === 0) {
      alert("Please select a file.");
      console.error("File input not found or no file selected.");
      return;
    }
 
    console.log("Upload Material Button clicked");
    console.log("File input element:", fileInput);
    console.log("File selected:", fileInput.files[0].name);
 
    const selectedFile = fileInput.files[0];
    const reader = new FileReader();
    reader.onload = function (e) {
      let uploadedFiles = JSON.parse(localStorage.getItem("materials")) || [];
      uploadedFiles.push({ name: selectedFile.name, subject: subject, url: e.target.result });
      localStorage.setItem("materials", JSON.stringify(uploadedFiles));
      console.log("Materials after upload:", JSON.stringify(uploadedFiles));
      alert("Material uploaded successfully!");
      loadMaterialsPage(subject);
    };
 
    reader.onerror = function (error) {
      console.error("Error reading file:", error);
      alert("Error reading file: " + error);
    };
 
    reader.readAsDataURL(selectedFile);
  });

  $(document).on("click", ".delete-material", function () {
    const user = getUser();
    if (!user || user.role !== "professor") {
      alert("Only professors can delete materials.");
      return;
    }

    const index = $(this).data("index");
    let uploadedFiles = JSON.parse(localStorage.getItem("materials")) || [];
    const hashSubject = window.location.hash.split('-')[0].replace('#','');
    const subjectFromHash = hashSubject ? (hashSubject.charAt(0).toUpperCase() + hashSubject.slice(1)) : "";
    let subject = localStorage.getItem("selectedSubject") || subjectFromHash;
    if (!subject) {
      alert("No subject selected. Please select a subject from the dropdown.");
      return;
    }

    if (confirm("Are you sure you want to delete this material?")) {
      uploadedFiles.splice(index, 1);
      localStorage.setItem("materials", JSON.stringify(uploadedFiles));
      loadMaterialsPage(subject);
    }
  });

  $(document).on("click", "#confirmBooking", function () {
    const user = getUser();
    if (!user || user.role !== "student") {
      alert("Only students can book appointments.");
      return;
    }

    const professorName = $("#bookingProfessorName").text();
    const date = $("#appointmentDate").val();
    const time = $("#appointmentTime").val();

    if (!professorName || !date || !time) {
      alert("Please select a valid professor, date, and time.");
      return;
    }

    const booking = {
      professor: professorName,
      student: user.name,
      date: date,
      time: time
    };

    let existingBookings = JSON.parse(localStorage.getItem("bookings")) || [];
    existingBookings.push(booking);
    localStorage.setItem("bookings", JSON.stringify(existingBookings));

    alert("Appointment booked successfully!");
    window.location.hash = "#manage-bookings";
  });

  // Display bookings
  function loadBookings(user) {
    const bookings = JSON.parse(localStorage.getItem("bookings")) || [];
    const bookingsList = $("#bookingsList");

    bookingsList.empty();

    if (user.role === "professor") {
      let professorHasBookings = false;
      bookings.forEach((booking, index) => {
        if (booking.professor === user.name) {
          professorHasBookings = true;
          bookingsList.append(`
            <div class="booking-card">
              <p><strong>Student:</strong> ${booking.student}</p>
              <p><strong>Date:</strong> ${booking.date}</p>
              <p><strong>Time:</strong> ${booking.time}</p>
              <div class="confirmation-area">
                ${booking.confirmed ? '<p class="text-success mt-2">Confirmed</p>' : ''}
              </div>
              ${!booking.confirmed ? `<button class="confirm-booking btn btn-success" data-index="${index}">Confirm</button>` : ''}
              <button class="delete-booking btn btn-danger" data-index="${index}">Cancel</button>
              <button class="btn btn-outline-primary send-message-btn " data-student="${booking.student}">Message</button>
              <textarea class="form-control mt-2 message-input" placeholder="Write a message..." style="display: none;"></textarea>
              <button class="btn btn-sm btn-secondary mt-1 send-message-submit" style="display: none;">Send</button>
            </div>
          `);
        }
      });
      if (!professorHasBookings) {
        bookingsList.append("<p>No bookings available.</p>");
      }
    } else {
      const studentBookings = bookings.filter(booking => booking.student === user.name);
      if (studentBookings.length === 0) {
        bookingsList.append("<p>You have no appointments.</p>");
      } else {
        studentBookings.forEach((booking, index) => {
          bookingsList.append(`
            <div class="booking-card">
              <p><strong>Professor:</strong> ${booking.professor}</p>
              <p><strong>Date:</strong> ${booking.date}</p>
              <p><strong>Time:</strong> ${booking.time}</p>
              ${booking.confirmed ? '<p class="text-success">Confirmed</p>' : '<p class="text-warning">Pending Confirmation</p>'}
              <button class="delete-booking btn btn-danger" data-index="${index}">Cancel</button>
            </div>
          `);
        });
      }
    }
  }

  // Login form submission
  $(document).on("submit", "#loginForm", function (e) {
    e.preventDefault();
    const email = $("#loginEmail").val();
    const password = $("#loginPassword").val();
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
        saveUser(user);  // Store logged-in user
        updateNavigation();  // Update navbar right after login

        // Redirect based on user role
        if (user.role === "admin") {
            // Redirect admins to Manage Users (Add Professors/Assistants page)
            window.location.hash = "#manage-users";
        } else if (user.role === "professor") {
            // Redirect professors to Manage Bookings
            window.location.hash = "#manage-bookings";
        } else {
            // Redirect students to Home
            window.location.hash = "#home";
        }
    } else {
        alert("Invalid email or password");
    }
});

  // Signup form submission
  $(document).on("submit", "#signupForm", function (e) {
    e.preventDefault();
    const name = $("#signupName").val();
    const email = $("#signupEmail").val();
    const password = $("#signupPassword").val();

    if (registerUser(name, email, password)) {
      alert("Signup successful. Please login.");
      window.location.hash = "#login";
    }
  });

  function validateUser(email, password) {
    const storedUser = JSON.parse(localStorage.getItem("testUser")) || null;
    if (storedUser && storedUser.email === email && storedUser.password === password) {
      return storedUser;
    }
    return null;
  }

  function registerUser(name, email, password) {
    let role = email.endsWith("@stu.ba") ? "student" : "professor";
    let users = JSON.parse(localStorage.getItem("users")) || [];
    users.push({ name, email, password, role });
    localStorage.setItem("users", JSON.stringify(users));
    return true;
  }

  $(document).on("click", "#logoutButton", logout);

  window.goToBooking = function(professorName, subject) {
    localStorage.setItem("selectedProfessorName", professorName);
    localStorage.setItem("selectedProfessorSubject", subject);
    window.location.hash = "#booking";
  };

  function loadBookingPage() {
    const professorName = localStorage.getItem("selectedProfessorName") || "Unknown Professor";
    const professorSubject = localStorage.getItem("selectedProfessorSubject") || "Unknown Subject";

    $("#bookingProfessorName").text(professorName);
    $("#bookingProfessorSubject").text(professorSubject);

    // Get today's date and format it correctly
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0'); // Ensures two-digit day
    const month = String(today.getMonth() + 1).padStart(2, '0'); // Ensures two-digit month (Months are 0-based)
    const year = today.getFullYear();

    const formattedDate = `${year}-${month}-${day}`; // Format for input[type="date"]

    // Set default date and disable past dates
    $("#appointmentDate").attr("min", formattedDate);
    $("#appointmentDate").val(formattedDate); // Pre-fill today's date in the input

    disablePastDates();
  }

  // New helper function to get booked times
  function getBookedTimes(selectedDate) {
    const bookings = JSON.parse(localStorage.getItem("bookings")) || [];
    return bookings
        .filter(booking => booking.date === selectedDate)
        .map(booking => booking.time);
  }

  // New function to populate time dropdown dynamically based on booked times
  function populateTimeDropdown() {
    const timeSelect = document.getElementById("appointmentTime");
    if (!timeSelect) return;

    timeSelect.innerHTML = "";
    const selectedDate = $("#appointmentDate").val();
    const bookedTimes = getBookedTimes(selectedDate);

    for (let hour = 9; hour <= 17; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
            const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
            const option = document.createElement("option");
            option.value = time;
            option.textContent = time;
            
            if (bookedTimes.includes(time)) {
                option.disabled = true; // Disable booked times
            }

            timeSelect.appendChild(option);
        }
    }
  }

  // Ensure the dropdown updates when the date changes
  $(document).on("change", "#appointmentDate", populateTimeDropdown);

  $(document).on("click", ".delete-booking", function () {
    const index = $(this).data("index");
    let bookings = JSON.parse(localStorage.getItem("bookings")) || [];

    if (confirm("Are you sure you want to delete this booking?")) {
        bookings.splice(index, 1);
        localStorage.setItem("bookings", JSON.stringify(bookings));
        loadBookings(getUser());
        
        // Update the time dropdown dynamically so deleted times become available again
        populateTimeDropdown();
    }
  });

  $(document).on("click", ".confirm-booking", function () {
    const index = $(this).data("index");
    let bookings = JSON.parse(localStorage.getItem("bookings")) || [];
    if (!bookings[index]) return;

    // Simulate sending email with meeting link
    alert("Simulated email sent with meeting link to the student.");

    bookings[index].confirmed = true;
    localStorage.setItem("bookings", JSON.stringify(bookings));

    // Update the UI by reloading bookings
    loadBookings(getUser());
  });

  // Ensure correct subject is loaded when navigating to materials pages
  $(document).ready(function () {
      let currentHash = window.location.hash;
      const subjectMap = {
          "math": "Mathematics",
          "physics": "Physics",
          "computer-science": "Computer Science",
          "chemistry": "Chemistry"
      };

      for (let key in subjectMap) {
          if (currentHash.includes(key)) {
              const detectedSubject = subjectMap[key];
              localStorage.setItem("selectedSubject", detectedSubject);
              console.log("Automatically detected subject on page load:", detectedSubject);
              loadMaterialsPage(detectedSubject);
              break;
          }
      }
  });

  window.addEventListener("hashchange", () => {
      const newSubject = detectSubjectFromHash();
      if (newSubject) {
          localStorage.setItem("selectedSubject", newSubject);
          console.log("Hash changed. Updated subject to:", newSubject);
          loadMaterialsPage(newSubject);
      }
  });
  app.run();
  updateNavigation();
});

$(document).on("click", ".edit-user", function () {
  const email = $(this).data("email");
  const $userCard = $(this).closest(".user-card");

  const $editableEmail = $userCard.find(".edit-email");
  const $editablePassword = $userCard.find(".edit-password");

  if ($(this).text() === 'Edit') {
    $editableEmail.prop('disabled', false);
    $editablePassword.prop('disabled', false).show();
    $(this).text('Save');
  } else {

    const newEmail = $editableEmail.val();
    const newPassword = $editablePassword.val();

    let users = JSON.parse(localStorage.getItem("users")) || [];
    const userIndex = users.findIndex(u => u.email === email);
    if (userIndex !== -1) {

      users[userIndex].email = newEmail;
      users[userIndex].password = newPassword;
      localStorage.setItem("users", JSON.stringify(users));
    }

    $editableEmail.prop('disabled', true);
    $editablePassword.prop('disabled', true).hide();
    $(this).text('Edit');

    alert("Changes saved successfully!");
    loadEditProfessors();
  }
});

$(document).on("click", "#editProfessorsList .delete-user", function () {
  const email = $(this).data("email");
  let users = JSON.parse(localStorage.getItem("users")) || [];
  users = users.filter(u => u.email !== email);
  localStorage.setItem("users", JSON.stringify(users));
  alert("User deleted successfully!");
  $(`.delete-user[data-email="${email}"]`).closest(".user-card").remove();
});

function loadUserManagement() {
  const user = getUser();
  if (!user || user.role !== "admin") {
    alert("Access denied. Only admins can manage users.");
    window.location.hash = "#login";
    return;
  }

  const usersList = $("#usersList");
  usersList.empty();
  const users = JSON.parse(localStorage.getItem("users")) || [];

  users.forEach((u, index) => {
    if (u.role !== "admin") {
      usersList.append(`
        <div class="user-card">
          
          <p><strong>Name:</strong> ${u.name}</p>
          <p><strong>Email:</strong> ${u.email}</p>
          <p><strong>Role:</strong> ${u.role}</p>
          <p><strong>Subjects:</strong> ${u.subjects ? u.subjects.join(', ') : "N/A"}</p>
          <button class="delete-user btn btn-danger" data-index="${index}">Delete</button>
        </div>
      `);
    }
  });
  
  const staffList = users.filter(u => u.role === "professor" || u.role === "assistant");
  
  if (staffList.length > 0) {
    usersList.append("<h3>All Professors and Assistants</h3>");
    staffList.forEach((staff, index) => {
      usersList.append(`
        <div class="user-card">
          <p><strong>Name:</strong> ${staff.name}</p>
          <p><strong>Email:</strong> ${staff.email}</p>
          <p><strong>Role:</strong> ${staff.role}</p>
          <p><strong>Subjects:</strong> ${staff.subjects ? staff.subjects.join(', ') : "N/A"}</p>
          <button class="delete-user btn btn-danger" data-index="${index}">Delete</button>
        </div>
      `);
    });
  } else {
    usersList.append("<p>No professors or assistants added yet.</p>");
  }
}

$(document).on("click", "#addUserBtn", function () {
  const name = $("#newUserName").val();
  const email = $("#newUserEmail").val();
  const password = $("#newUserPassword").val();
  const role = $("#newUserRole").val();
  const subject = $("#newUserProject").val();

  if (!name || !email || !password || !role || !subject) {
    alert("Please fill all fields.");
    return;
  }

  let users = JSON.parse(localStorage.getItem("users")) || [];
  if (users.some(u => u.email === email)) {
    alert("Email already in use. Please use a different email.");
    return;
  }

  const newUser = {
    name,
    email,
    password,
    role,
    subjects: [subject]
  };

  users.push(newUser);
  localStorage.setItem("users", JSON.stringify(users));
  alert("User added successfully!");

  // Reset the form
  $("#addUserForm")[0].reset();

  // Redirect to edit-professors to immediately show the update
  window.location.hash = "#edit-professors";
});

$(document).on("click", ".delete-user", function () {
  const email = $(this).data("email");
  let users = JSON.parse(localStorage.getItem("users")) || [];
  users = users.filter(u => u.email !== email);
  localStorage.setItem("users", JSON.stringify(users));
  alert("User deleted successfully!");
  loadEditProfessors();
});

$(document).on("click", ".send-message-btn", function () {
  const $card = $(this).closest(".booking-card");
  $card.find(".message-input, .send-message-submit").show();
});

$(document).on("click", ".send-message-submit", function () {
  const $card = $(this).closest(".booking-card");
  const message = $card.find(".message-input").val();
  const to = $card.find(".send-message-btn").data("student");

  if (!message.trim()) {
    alert("Please write a message.");
    return;
  }

  const professor = getUser();
  const messages = JSON.parse(localStorage.getItem("messages")) || [];
  messages.push({
    from: professor.email,
    to: to,
    message: message,
    timestamp: new Date().toISOString()
  });
  localStorage.setItem("messages", JSON.stringify(messages));

  alert("Message sent successfully.");
  $card.find(".message-input").val("").hide();
  $card.find(".send-message-submit").hide();
});


function createSession() {
  const title = document.getElementById('sessionTitle').value;
  const time = document.getElementById('sessionTime').value;
  const location = document.getElementById('sessionLocation').value;
  const capacity = document.getElementById('sessionCapacity').value;
  const user = getUser(); // Retrieve the logged-in user

  const sessionData = {
      id: Date.now(),  // Unique ID for the session
      title,
      time,
      location,
      capacity,
      attendees: 0,
      professor: user ? user.email : "unknown"
  };

  let sessions = JSON.parse(localStorage.getItem('liveSessions')) || [];
  sessions.push(sessionData);
  localStorage.setItem('liveSessions', JSON.stringify(sessions));
  displaySessions();  // Update the list after adding a new session
}

function displaySessions() {
  const sessions = JSON.parse(localStorage.getItem('liveSessions')) || [];
  const sessionsList = document.getElementById('sessionsList');
  if (!sessionsList) return; // Prevent error if element doesn't exist
  sessionsList.innerHTML = '';  // Clear existing content

  const user = getUser();
  const isProfessor = user && user.role === 'professor';
  const isStudent = user && user.role === 'student';

  const heading = document.createElement('h3');
  heading.textContent = isProfessor ? "📅 Upcoming My Sessions" : "📅 Upcoming Live Sessions";
  heading.classList.add('mb-3');
  sessionsList.appendChild(heading);

  sessions.forEach(session => {
    if (isProfessor && session.professor !== user.email) return; // Skip sessions not created by this professor
    const sessionElement = document.createElement('div');
    sessionElement.className = 'card p-3 mb-3 shadow-sm';

    sessionElement.innerHTML = `
      <h5 class="card-title">${session.title}</h5>
      <p class="mb-1"><strong>Time:</strong> ${session.time}</p>
      <p class="mb-1"><strong>Location:</strong> ${session.location}</p>
      <p class="mb-1"><strong>Professor:</strong> ${session.professor}</p>
      <p class="mb-2"><strong>Spots left:</strong> ${session.capacity - session.attendees}</p>
    `;

    const btnContainer = document.createElement('div');
    btnContainer.classList.add('d-flex', 'gap-2');

    if (isStudent && session.attendees < session.capacity) {
      const joinBtn = document.createElement('button');
      joinBtn.className = 'btn btn-outline-success';
      joinBtn.textContent = "I'm Coming";
      joinBtn.onclick = () => rsvpSession(session.id);
      btnContainer.appendChild(joinBtn);
    }

    if (isProfessor) {
      const editBtn = document.createElement('button');
      editBtn.className = 'btn btn-outline-primary';
      editBtn.textContent = 'Edit';
      editBtn.onclick = () => {
        const cardBody = sessionElement;
        cardBody.innerHTML = `
          <div class="row g-2">
            <div class="col-md-3">
              <input class="form-control" type="text" value="${session.title}" id="editTitle-${session.id}" placeholder="Title">
            </div>
            <div class="col-md-3">
              <input class="form-control" type="datetime-local" value="${session.time}" id="editTime-${session.id}">
            </div>
            <div class="col-md-3">
              <input class="form-control" type="text" value="${session.location}" id="editLocation-${session.id}" placeholder="Location">
            </div>
            <div class="col-md-2">
              <input class="form-control" type="number" value="${session.capacity}" id="editCapacity-${session.id}" placeholder="Capacity">
            </div>
            <div class="col-md-1 d-grid gap-2">
              <button class="btn btn-success" id="saveEdit-${session.id}">💾</button>
              <button class="btn btn-secondary" id="cancelEdit-${session.id}">✖</button>
            </div>
          </div>
        `;

        document.getElementById(`saveEdit-${session.id}`).onclick = () => {
          const newTitle = document.getElementById(`editTitle-${session.id}`).value;
          const newTime = document.getElementById(`editTime-${session.id}`).value;
          const newLocation = document.getElementById(`editLocation-${session.id}`).value;
          const newCapacity = parseInt(document.getElementById(`editCapacity-${session.id}`).value, 10);

          if (newTitle && newTime && newLocation && !isNaN(newCapacity)) {
            session.title = newTitle;
            session.time = newTime;
            session.location = newLocation;
            session.capacity = newCapacity;
            localStorage.setItem('liveSessions', JSON.stringify(sessions));
            displaySessions();  // Re-render sessions
          } else {
            alert("Invalid input. Please fill all fields correctly.");
          }
        };

        document.getElementById(`cancelEdit-${session.id}`).onclick = () => {
          displaySessions();  // Re-render to revert changes
        };
      };
      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'btn btn-outline-danger';
      deleteBtn.textContent = 'Delete';
      deleteBtn.onclick = () => {
        let allSessions = JSON.parse(localStorage.getItem('liveSessions')) || [];
        allSessions = allSessions.filter(s => s.id !== session.id);
        localStorage.setItem('liveSessions', JSON.stringify(allSessions));
        displaySessions();
      };
      btnContainer.appendChild(editBtn);
      btnContainer.appendChild(deleteBtn);
    }

    sessionElement.appendChild(btnContainer);
    sessionsList.appendChild(sessionElement);
  });
}

function rsvpSession(sessionId) {
  let sessions = JSON.parse(localStorage.getItem('liveSessions'));
  const session = sessions.find(s => s.id === sessionId);
  if (session && session.attendees < session.capacity) {
      session.attendees++;
      localStorage.setItem('liveSessions', JSON.stringify(sessions));
      displaySessions();  // Refresh list to update remaining spots
  } else {
      alert('Sorry, this session is full!');
  }
}

// Call displaySessions initially to show any stored sessions
function loadMessages() {
    const user = getUser();
    if (!user || user.role !== 'student') return;
    
    const container = document.getElementById('studentMessages');
    if (!container) return;
    
    const messages = JSON.parse(localStorage.getItem('messages')) || [];
    const userMessages = messages.filter(m => m.to === user.name || m.to === user.email);
    
    container.innerHTML = '';
    
    if (userMessages.length === 0) {
        container.innerHTML = '<p>No messages yet.</p>';
        return;
    }
    
    userMessages.forEach((msg, index) => {
        const messageCard = document.createElement('div');
        messageCard.className = 'message-card border p-3 mb-3 rounded bg-light';
        messageCard.innerHTML = `
            <p><strong>From:</strong> ${msg.from}</p>
            <p><strong>Message:</strong> ${msg.message}</p>
            <p class="text-muted"><small>${new Date(msg.timestamp).toLocaleString()}</small></p>
            <button class="mark-read btn btn-success btn-sm">Mark as Read</button>
        `;
        container.appendChild(messageCard);
        
        // Add event listener for the "Mark as Read" button
        messageCard.querySelector('.mark-read').onclick = () => {
            const messageIndex = messages.findIndex(m => m.timestamp === msg.timestamp && m.from === msg.from && m.to === msg.to);
            if (messageIndex !== -1) {
                messages.splice(messageIndex, 1); // Delete the message
                localStorage.setItem('messages', JSON.stringify(messages)); // Save updated messages
            }
            messageCard.style.display = 'none'; // Remove message from view immediately
        };
    });
}

// Ensure loadMessages() is called when navigating back to the messages page
window.addEventListener("hashchange", () => {
  if (window.location.hash === "#messages") {
    loadMessages();
  }
});