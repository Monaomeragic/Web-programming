// Admin: Load all bookings (admin view) as inline lines

function loadAdminBookings() {
  const user = getUser();
  if (!user || user.role !== "admin") {
    alert("Access denied.");
    return;
  }
  const $container = $("#admin-bookings");
  $container.empty();

  $.ajax({
    url: "http://localhost/MonaOmeragic/Web-programming/backend/appointments",
    method: "GET",
    beforeSend: function(xhr) {
      const token = localStorage.getItem("user_token");
      if (token) {
        xhr.setRequestHeader("Authorization", "Bearer " + token);
        xhr.setRequestHeader("Authentication", token);
      }
    },
    success: function(bookings) {
      if (!Array.isArray(bookings) || bookings.length === 0) {
        $container.append("<p>No bookings found.</p>");
        return;
      }
      bookings.forEach(b => {
        $container.append(`
          <div class="booking-line" style="padding:10px; border-bottom:1px solid #ccc;">
            Booking ID: ${b.id} | 
            Student ID: ${b.student_id} | 
            Professor ID: ${b.professor_id} | 
            Date: ${b.date} | 
            Status: ${b.status || 'N/A'}
          </div>
        `);
      });
    },
    error: function() {
      $container.append("<p class='text-danger'>Failed to load bookings.</p>");
    }
  });
}

function getUser() {
  const token = localStorage.getItem("user_token");
  const payload = token ? JSON.parse(atob(token.split('.')[1])) : null;
  return payload ? payload.user : null;
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
function loadEditProfessors() {
  const selectedSubject = $('#subjectFilter').val() || 'all'; // Ensure a default value of 'all' is used if nothing is selected
  const container = $('#editProfessorsList');
  container.empty();

  $.ajax({
    url: "http://localhost/MonaOmeragic/Web-programming/backend/users",
    method: "GET",
    beforeSend: function(xhr) {
      const token = localStorage.getItem("user_token");
      if (token) {
        xhr.setRequestHeader("Authentication", token);
        xhr.setRequestHeader("Authorization", "Bearer " + token);
      }
    },
    success: function(users) {
      users.forEach(u => {
        if (typeof u.subjects === "string") {
          u.subjects = [u.subjects];
        } else if (!Array.isArray(u.subjects)) {
          u.subjects = [];
        }
      });

      const filteredUsers = users.filter(user =>
        (user.role === 'professor' || user.role === 'assistant') &&
        (selectedSubject === 'all' ||
         (user.subjects && user.subjects.includes(selectedSubject.charAt(0).toUpperCase() + selectedSubject.slice(1)))
        )
      );

      container.empty();

      if (filteredUsers.length > 0) {
        filteredUsers.forEach(user => {
          container.append(`
              <div class="user-card">
                <p><strong>Name:</strong> ${user.username || user.name}</p>
                <p><strong>Email:</strong> <input class="edit-email form-control" type="email" value="${user.email}" disabled></p>
                <p><strong>Password:</strong> <input class="edit-password form-control" type="password" value="${user.password}" style="display: none;" disabled></p>
                <p><strong>Role:</strong> ${user.role}</p>
                <p><strong>Subjects:</strong> ${
                  Array.isArray(user.subjects)
                    ? user.subjects.join(', ')
                    : (typeof user.subjects === "string" && user.subjects.length)
                      ? user.subjects
                      : "N/A"
                }</p>
                <button class="edit-user btn btn-primary" data-email="${user.email}">Edit</button>
                <button class="delete-user btn btn-danger" data-id="${user.id}">Delete</button>
              </div>
          `);
        });
      } else {
        container.append('<p>No professors or assistants found for the selected subject.</p>');
      }
    },
    error: function(xhr) {
      console.error("Error fetching staff:", xhr.responseText || xhr.statusText);
      container.html("<p class='text-danger'>Failed to load staff. Please try again later.</p>");
    }
  });
}
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

  let app = $.spapp({
    defaultView: 'home',
    pageNotFound: 'error_404.html',
    templateDir: 'tpl/'
  });

  let users = JSON.parse(localStorage.getItem("users")) || [];
  if (!users.find(u => u.email === "admin@admin.com")) {
    users.push({ name: "Admin", email: "admin@admin.com", password: "admin123", role: "admin", subjects: [] });
    localStorage.setItem("users", JSON.stringify(users));
  }
  
  // DEV ONLY: Reset users if needed

  function saveUser(user) {
    // nothing to do; token is the source of truth
  }

  function logout() {
    localStorage.removeItem("user_token");
    window.location.hash = "#login";
    // Force a reload so that the login view is rendered immediately
    window.location.reload();
  }

function updateNavigation() {
  // Navigation display logic
  $("#homeNav, #bookingNav, #manageBookingsNav, #adminBookingsNav, #manageUsersNav, #editProfessorsNav, #liveSessionsNav, #messagesNav, #materialsDropdown, #adminAddNav, #adminEditNav").hide();
  const user = getUser();
  const hash = window.location.hash;

  if (hash === "#login" || hash === "#signup") {
    $("#navbar").hide();
    $("#logoutButton").hide();
    return;
  }

  if (user && hash !== "#login" && hash !== "#signup") {
    $("#navbar, #logoutButton").show();
    $("#appRole").text(capitalizeFirstLetter(user.role));

    if (user.role === "admin") {
      $("#manageUsersNav, #adminBookingsNav").show();
      $("#adminAddNav, #adminEditNav").show(); // ensure custom admin links are also shown if present
      addAdminNavigation();
    } else if (user.role === "professor" || user.role === "assistant") {
      $("#manageBookingsNav, #liveSessionsNav, #messagesNav, #materialsDropdown").show();
    } else if (user.role === "student") {
      $("#homeNav, #manageBookingsNav, #messagesNav, #materialsDropdown, #liveSessionsNav").show();
    }
  } else {
    $("#navbar").hide();
    $("#logoutButton").hide();
    $("#appTitle").text('Appointment System');
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
  app.route({
    view: 'home',
    load: 'home.html',
    onReady: function () {
      console.log('Home page loaded.');
      setTimeout(() => {
        loadHome();
        updateNavigation();
      }, 100);
    }
  });
  app.route({
    view: 'manage-bookings',
    load: 'manage-bookings.html',
    onReady: function () {
      console.log("Manage Bookings page loaded.");
      setTimeout(() => {
        loadManageBookings();
        updateNavigation();
      }, 100);
    }
  });
  app.route({
    view: 'booking',
    load: 'booking.html',
    onReady: function() {
      console.log('Booking page loaded.');
      setTimeout(() => {
        loadBooking();
        updateNavigation();
      }, 100);
    }
  });
  app.route({
    view: 'math-materials',
    load: 'math-materials.html',
    onReady: function() {
      localStorage.setItem("selectedSubject", "Mathematics");
      console.log('Mathematics Materials page loaded.');
      setTimeout(() => {
        loadMaterialsPage("Mathematics");
        updateNavigation();
      }, 100);
    }
  });
  app.route({
    view: 'physics-materials',
    load: 'physics-materials.html',
    onReady: function() {
      localStorage.setItem("selectedSubject", "Physics");
      console.log('Physics Materials page loaded.');
      setTimeout(() => {
        loadMaterialsPage("Physics");
        updateNavigation();
      }, 100);
    }
  });
  app.route({
    view: 'computer-science-materials',
    load: 'computer-science-materials.html',
    onReady: function() {
      localStorage.setItem("selectedSubject", "Computer Science");
      console.log('Computer Science Materials page loaded.');
      setTimeout(() => {
        loadMaterialsPage("Computer Science");
        updateNavigation();
      }, 100);
    }
  });
  app.route({
    view: 'chemistry-materials',
    load: 'chemistry-materials.html',
    onReady: function() {
      localStorage.setItem("selectedSubject", "Chemistry");
      console.log('Chemistry Materials page loaded.');
      setTimeout(() => {
        loadMaterialsPage("Chemistry");
        updateNavigation();
      }, 100);
    }
  });
  app.route({ view: 'manage-users', load: 'manage-users.html', onReady: function () { loadUserManagement(); updateNavigation(); } });
  app.route({ view: 'edit-professors', load: 'edit-professors.html', onReady: loadEditProfessors });
  app.route({
    view: 'messages',
    load: 'messages.html',
    onReady: function() {
      console.log('Messages page loaded.');
      setTimeout(() => {
        loadMessages();
        updateNavigation();
      }, 200);
    }
  });
  app.route({
    view: 'live-session',
    load: 'live-session.html',
    onReady: function() {
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
        updateNavigation();
      }, 200);
    }
  });
  // Admin bookings SPA route
  app.route({
    view: 'admin-bookings',
    load: 'admin-bookings.html',
    onReady: function() {
      setTimeout(() => {
        $("#admin-bookings").show();
        loadAdminBookings();
        updateNavigation();
      }, 300);
    }
  });
  

  function loadHome() {
    console.log(">>> Entering loadHome, user:", getUser(), "hash:", window.location.hash);
    const user = getUser();
    if (!user) {
      window.location.hash = "#login";
      return;
    }
    updateNavigation();
    const container = $("#professorList");
    if (!container.length) return;
    container.empty();
    $.ajax({
      url: "http://localhost/MonaOmeragic/Web-programming/backend/users/staff",
      method: "GET",
      beforeSend: function(xhr) {
        const token = localStorage.getItem("user_token");
        if (token) {
          xhr.setRequestHeader("Authorization", "Bearer " + token);
          xhr.setRequestHeader("Authentication", token);
        }
      },
      success: function(users) {
        users.forEach(u => {
          if (typeof u.subjects === "string") {
            u.subjects = [u.subjects];
          }
        });
        const staffList = users.filter(u => {
          const hasSubjects = u.subjects && Array.isArray(u.subjects) && u.subjects.length > 0;
          return (u.role === "professor" || u.role === "assistant") && hasSubjects;
        });
        if (staffList.length === 0) {
          container.append("<p>No professors or assistants available at the moment.</p>");
          return;
        }
        const subjectSet = new Set();
        staffList.forEach(user => {
          if (!user.subjects) return;
          user.subjects.forEach(subject => subjectSet.add(subject));
        });
        subjectSet.forEach(subject => {
          const subjectStaff = staffList.filter(user => {
            if (!user.subjects) return false;
            return user.subjects.includes(subject);
          });
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
                  <p><strong>Name:</strong> ${staff.name || staff.username}</p>
                  <p><strong>Email:</strong> ${staff.email}</p>
                  <p><strong>Role:</strong> ${staff.role}</p>
                  <button class="btn btn-primary" onclick="goToBooking('${staff.name || staff.username}', '${subject}', ${staff.id})">Book</button>
                </div>
              `);
            });
            container.append(box);
          }
        });
      },
      error: function(xhr) {
        console.error(">>> Error in loadHome AJAX:", xhr.status, xhr.responseText);
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
    const user = getUser();
    if (!user) {
      window.location.hash = "#login";
      return;
    }
    const profName = localStorage.getItem("selectedProfessorName");
    const profSubject = localStorage.getItem("selectedProfessorSubject");
    const profId = parseInt(localStorage.getItem("selectedProfessorId"), 10);

    // If no professor was selected, go back to home
    if (!profName || !profSubject || !profId || isNaN(profId)) {
      window.location.hash = "#home";
      return;
    }

    // Proceed to load the booking page
    loadBookingPage();
    setTimeout(populateTimeDropdown, 0);
    updateNavigation();
  }

  function loadMaterialsPage(subject) {
    if (!subject || !subject.trim()) {
      alert("Please select a subject.");
      return;
    }

    const containerId = subject.toLowerCase().replace(/\s/g, '') + 'MaterialsContainer';
    const container = document.getElementById(containerId);
    if (!container) return;

    // Show a loading message
    container.innerHTML = '<p>Loading materials…</p>';

    // Fetch materials from backend using service callbacks
    MaterialsService.getAll(
      subject,
      function(response) {
        const list = response.data || [];
        container.innerHTML = ''; // clear loading text
        if (
          list
            .filter(mat => mat.subject_name === subject)
            .length === 0
        ) {
          container.innerHTML = '<p>No materials uploaded yet.</p>';
        } else {
          list
            .filter(mat => mat.subject_name === subject)
            .forEach(mat => {
              const user = getUser();
              // Only professors see the delete button for their own uploads
              const deleteBtn = (user && user.role === 'professor' && user.id === mat.professor_id)
                ? `<button class="delete-material btn btn-danger" data-id="${mat.id}">Delete</button>`
                : '';
              // Show image if it's an image file, otherwise show download link
              let fileEl;
              if (mat.material_url && mat.material_url.startsWith('data:image')) {
                fileEl = `<img src="${mat.material_url}" style="max-width:200px;max-height:150px;" />`;
              } else if (mat.material_url) {
                fileEl = `<a href="${mat.material_url}" target="_blank" download="${mat.material_title}">${mat.material_title}</a>`;
              } else {
                fileEl = '<span class="text-danger">No file</span>';
              }
              container.insertAdjacentHTML('beforeend', `
                <div class="material-item mb-3 border p-2">
                  <h5>${mat.material_title}</h5>
                  ${fileEl}
                  <p class="text-muted">By: ${mat.professor_name || mat.professor_id}</p>
                  ${deleteBtn}
                </div>
              `);
            });
        }
        // Add upload section for professors only
        const currentUser = getUser();
        if (currentUser && currentUser.role === 'professor') {
          container.insertAdjacentHTML('beforeend', `
            <div id="uploadSection" class="mt-3">
              <input type="text" id="uploadMaterialTitle" placeholder="Material Title" class="form-control mb-2"/>
              <input type="file" id="uploadMaterial" />
              <button id="uploadMaterialBtn" class="btn btn-primary">Upload Material</button>
            </div>
          `);
        }
      },
      function(errorMsg) {
        console.error("Failed to load materials:", errorMsg);
        container.innerHTML = "<p class='text-danger'>Failed to load materials.</p>";
      }
    );
  }

  $(document).on("click", "#materialsDropdown a", function (e) {
    e.preventDefault();
    let subject = $(this).text().trim();
    console.log("Dropdown clicked. Subject selected:", subject);
    localStorage.setItem("selectedSubject", subject);
    console.log("Stored subject in localStorage:", localStorage.getItem("selectedSubject"));
    loadMaterialsPage(subject);
    window.location.hash = subject.toLowerCase().replace(/\s+/g, '-') + "-materials";
  });

  // Update list when subject dropdown changes
  $(document).on("change", "#subjectFilter", function () {
    loadEditProfessors();
  });
  // Upload material handler using multipart/form-data
  $(document).off("click", "#uploadMaterialBtn").on("click", "#uploadMaterialBtn", function () {
    const title = $("#uploadMaterialTitle").val().trim();
    const fileInput = document.getElementById("uploadMaterial");
    if (!fileInput || fileInput.files.length === 0) {
      alert("Please select a file.");
      return;
    }
    const file = fileInput.files[0];
    const subject = localStorage.getItem("selectedSubject");
    const user = getUser();

    // Build FormData for multipart upload
    const formData = new FormData();
    formData.append("professor_id", user.id);
    // formData.append("subject_name", subject); // REMOVED as per instructions
    formData.append("material_title", title || file.name);
    formData.append("file", file);

    // Send multipart/form-data to backend
    $.ajax({
      url: Constants.PROJECT_BASE_URL + "/materials/" + encodeURIComponent(subject),
      method: "POST",
      data: formData,
      processData: false,
      contentType: false,
      beforeSend: function(xhr) {
        const token = localStorage.getItem("user_token");
        if (token) {
          xhr.setRequestHeader("Authorization", "Bearer " + token);
          xhr.setRequestHeader("Authentication", token);
        }
      },
      success: function() {
        alert("Material uploaded successfully!");
        loadMaterialsPage(subject);
      },
      error: function(xhr) {
        const msg = xhr.responseJSON?.message || xhr.responseText || xhr.statusText;
        alert("Upload failed: " + msg);
      }
    });
  });

  $(document).off("click", ".delete-material").on("click", ".delete-material", function () {
    const id = $(this).data("id");
    if (!id) {
      alert("No material ID provided!");
      return;
    }
    if (!confirm("Are you sure you want to delete this material?")) return;

    const subject = localStorage.getItem("selectedSubject") || "Mathematics"; // fallback to Mathematics

    $.ajax({
      url: "http://localhost/MonaOmeragic/Web-programming/backend/materials/" + id,
      method: "DELETE",
      beforeSend: function(xhr) {
        const token = localStorage.getItem("user_token");
        if (token) {
          xhr.setRequestHeader("Authorization", "Bearer " + token);
          xhr.setRequestHeader("Authentication", token);
        }
      },
      success: function(res) {
        alert("Material deleted!");
        loadMaterialsPage(subject); // refresh the materials list
      },
      error: function(xhr) {
        const msg = xhr.responseJSON?.message || xhr.responseText || xhr.statusText;
        alert("Delete failed: " + msg);
      }
    });
  });

  $(document).on("click", "#submitBookingBtn, #confirmBooking", function () {
      const user = getUser();
      if (!user || user.role !== "student") {
          alert("Only students can book appointments.");
          return;
      }

      // Retrieve selected professor info
      const professorName = localStorage.getItem("selectedProfessorName");
      const professorSubject = localStorage.getItem("selectedProfessorSubject");
      const professorId = parseInt(localStorage.getItem("selectedProfessorId"), 10);

      const bookingDate = $("#appointmentDate").val();
      const bookingTime = $("#appointmentTime").val();

      // Defensive: ensure all required fields are present
      if (!professorName || !bookingDate || !bookingTime || !professorId || isNaN(professorId)) {
          alert("Please select a valid professor, date, and time.");
          return;
      }

      const dateTime = `${bookingDate} ${bookingTime}`;
      const bookingData = {
          student_id: user.id,
          professor_id: professorId,
          date: dateTime
      };

      // Debug: print booking payload
      console.log("Booking payload:", bookingData);

      // Ensure the correct Authorization header is sent
      if (typeof AppointmentService.create === "function") {
          AppointmentService.create(
              bookingData,
              function() {
                  alert("Appointment booked successfully!");
                  window.location.hash = "#manage-bookings";
                  loadManageBookings();
              },
              function(xhr) {
                  const msg = xhr.responseJSON?.error || xhr.responseText || xhr.statusText;
                  alert("Error booking appointment: " + msg);
              }
          );
      } else {
          // Fallback: direct AJAX if service isn't wired up
          $.ajax({
              url: "http://localhost/MonaOmeragic/Web-programming/backend/appointments",
              method: "POST",
              contentType: "application/json",
              data: JSON.stringify(bookingData),
              beforeSend: function(xhr) {
                  const token = localStorage.getItem("user_token");
                  if (token) {
                      xhr.setRequestHeader("Authorization", "Bearer " + token);
                      xhr.setRequestHeader("Authentication", token);
                  }
              },
              success: function() {
                  alert("Appointment booked successfully!");
                  window.location.hash = "#manage-bookings";
                  loadManageBookings();
              },
              error: function(xhr) {
                  const msg = xhr.responseJSON?.error || xhr.responseText || xhr.statusText;
                  alert("Error booking appointment: " + msg);
              }
          });
      }
  });

  // Display bookings
  function loadBookings(user) {
    if (!user) return;
    if (typeof AppointmentService.list === "function" && AppointmentService.list.length >= 2) {
      AppointmentService.list(
        function(bookings) {
          $.ajax({
            url: "http://localhost/MonaOmeragic/Web-programming/backend/users",
            method: "GET",
            beforeSend: function (xhr) {
              const tk = localStorage.getItem("user_token");
              if (tk) {
                xhr.setRequestHeader("Authorization", "Bearer " + tk);
                xhr.setRequestHeader("Authentication", tk);
              }
            },
            success: function (staff) {
              window.__userMap = {};
              (staff || []).forEach(u => window.__userMap[Number(u.id)] = u);

              finishRender(bookings);
            },
            error: function () {
              window.__userMap = {};
              finishRender(bookings);
            }
          });

          function finishRender(bookings) {
            bookings.forEach(b => {
              if (b.date) {
                const parts = b.date.split(" ");
                b.originalDate = parts[0];
                b.originalTime = parts[1] || "";
              }
            });
            bookings.forEach(b => {
              if (b.date && !b.time) {
                const parts = b.date.split(" ");
                b.date = parts[0];
                b.time = parts[1] || "";
              }
              const prof = window.__userMap[b.professor_id];
              b.professor = prof ? (prof.username || prof.name || prof.email) : "Unknown";
            });

            bookings.forEach(b => {
              const student = window.__userMap[b.student_id];
              b.studentName = student?.name || student?.username || "Unknown";
              b.studentEmail = student?.email || "Unknown";
            });

            const bookingsList = $("#bookingsList");
            bookingsList.empty();  // Ensure old cards are cleared before re-rendering
            if (user.role === "professor") {
              let professorHasBookings = false;
              bookings.forEach((booking, index) => {
                if (Number(booking.professor_id) === Number(user.id)) {
                  professorHasBookings = true;
                  bookingsList.append(`
                    <div class="booking-card">
                      <p><strong>Student:</strong> ${booking.studentName}</p>
                      <p><strong>Email:</strong> ${booking.studentEmail}</p>
                      <p><strong>Appointment Date:</strong> ${booking.originalDate || booking.date?.split(" ")[0] || "Unknown"}</p>
                      <p><strong>Appointment Time:</strong> ${booking.originalTime || booking.time || (booking.date?.split(" ")[1]) || "Unknown"}</p>
                      ${
                        booking.status === "confirmed" && booking.confirmed_at
                          ? `<p><strong>Confirmed Time:</strong> ${booking.confirmed_at.split(" ")[1]}</p>`
                          : ""
                      }
                      <div class="confirmation-area">
                        ${
                          booking.status === "confirmed"
                            ? '<p class="text-success mt-2">Confirmed</p>'
                            : booking.status === "canceled"
                            ? '<p class="text-danger mt-2">Canceled</p>'
                            : '<p class="text-warning mt-2">Pending Confirmation</p>'
                        }
                      </div>
                      ${!booking.confirmed ? `<button class="confirm-booking btn btn-success" data-index="${index}">Confirm</button>` : ''}
                      <button class="delete-booking btn btn-danger" data-id="${booking.id}">Cancel</button>
                      <button class="btn btn-outline-primary send-message-btn" data-student-id="${booking.student_id}" data-student="${booking.studentName}">Message</button>
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
              const studentBookings = bookings;   // backend already returns only this student's bookings
              if (studentBookings.length === 0) {
                bookingsList.append("<p>You have no appointments.</p>");
              } else {
                studentBookings.forEach((booking, index) => {
                  bookingsList.append(`
                    <div class="booking-card">
                      <p><strong>Professor:</strong> ${booking.professor}</p>
                      <p><strong>Date:</strong> ${booking.date}</p>
                      <p><strong>Time:</strong> ${booking.time}</p>
                      ${
                        booking.status === "confirmed"
                          ? '<p class="text-success">Confirmed</p>'
                          : booking.status === "canceled"
                          ? '<p class="text-danger">Canceled</p>'
                          : '<p class="text-warning">Pending Confirmation</p>'
                      }
                      <button class="delete-booking btn btn-danger" data-id="${booking.id}">Cancel</button>
                    </div>
                  `);
                });
              }
            }
          }
        },
        function(xhr) {
          console.error("Error loading bookings:", xhr.responseText);
          $("#bookingsList").html("<p class='text-danger'>Failed to load bookings.</p>");
        },
        {
          beforeSend: function(xhr) {
            const token = localStorage.getItem("user_token");
            if (token) {
              xhr.setRequestHeader("Authorization", "Bearer " + token);
              xhr.setRequestHeader("Authentication", token);
            }
          }
        }
      );
    }
  }


  // Deprecated: validateUser handled by backend

  function registerUser(name, email, password) {
    // AJAX-based registration expected
    let role = email.endsWith("@stu.ba") ? "student" : "professor";
    // Optionally: send AJAX to backend for registration
    // For now, fallback to localStorage for demo
    let users = JSON.parse(localStorage.getItem("users")) || [];
    users.push({ name, email, password, role });
    localStorage.setItem("users", JSON.stringify(users));
    return true;
  }

  $(document).on("click", "#logoutButton", logout);

  window.goToBooking = function(professorName, subject, professorId) {
    localStorage.setItem("selectedProfessorName", professorName);
    localStorage.setItem("selectedProfessorSubject", subject);
    localStorage.setItem("selectedProfessorId", professorId);
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

  function disablePastDates() {
    const today = new Date().toISOString().split('T')[0];
    $("#appointmentDate").attr("min", today);
  }

  function getBookedTimes(professorId, selectedDate, cb) {
    const safeCB = typeof cb === "function" ? cb : function () {};
    if (!professorId || !selectedDate) return safeCB([]);
    let normalizedDate = selectedDate;
    if (typeof normalizedDate === "string") {
      if (/^\d{2}\.\d{2}\.\d{4}$/.test(normalizedDate)) {
        const [day, month, year] = normalizedDate.split(".");
        normalizedDate = `${year}-${month}-${day}`;
      }
    }
    let dateObj = new Date(normalizedDate);
    if (isNaN(dateObj.getTime())) {
      dateObj = new Date(Date.parse(normalizedDate));
    }
    if (isNaN(dateObj.getTime())) {
      return safeCB([]);
    }

    $.ajax({
      url:
        "http://localhost/MonaOmeragic/Web-programming/backend/appointments?professor_id=" +
        professorId,
      method: "GET",
      beforeSend: function (xhr) {
        const token = localStorage.getItem("user_token");
        if (token) {
          xhr.setRequestHeader("Authorization", "Bearer " + token);
          xhr.setRequestHeader("Authentication", token);
        }
      },
      success: function (bookings) {
        const isoDate = new Date(selectedDate).toISOString().split("T")[0]; // converts any valid date to YYYY-MM-DD
        console.log("📆 Formatted selected date:", isoDate);
        console.log("📋 Raw bookings returned:", bookings);

        const times = (bookings || [])
          .filter(b => Number(b.professor_id) === Number(professorId))
          .filter(b => b.date && b.date.startsWith(isoDate))
          .map(b => {
            const parts = b.date.split(" ");
            const time = (parts[1] || "").slice(0, 5);
            console.log("⏰ Disabled time:", time);
            return time;
          });

        safeCB(times);
      },
      error: function () {
        safeCB([]);
      },
    });
  }

  function populateTimeDropdown() {
    const timeSelect = document.getElementById("appointmentTime");
    if (!timeSelect) return;

    const selectedDate = $("#appointmentDate").val();
    const professorId = parseInt(localStorage.getItem("selectedProfessorId"), 10);

    // First clear any existing options
    timeSelect.innerHTML = "";

    getBookedTimes(professorId, selectedDate, function (bookedTimes) {
      for (let hour = 9; hour <= 17; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
          const time = `${hour.toString().padStart(2, "0")}:${minute
            .toString()
            .padStart(2, "0")}`;
          const option = document.createElement("option");
          option.value = time;
          option.textContent = time;

          if (bookedTimes.includes(time)) {
            option.disabled = true; // Disable already‑booked slots
          }

          timeSelect.appendChild(option);
        }
      }
    });
  }

  $(document).on("change", "#appointmentDate", populateTimeDropdown);

  $(document).on("click", ".confirm-booking", function () {
    const index = $(this).data("index");
    const bookingCard = $(".booking-card").eq(index);
    const bookingId = bookingCard.find(".delete-booking").data("id");

    $.ajax({
      url: `http://localhost/MonaOmeragic/Web-programming/backend/appointments/confirm/${bookingId}`,
      method: "PATCH",
      beforeSend: function (xhr) {
        const token = localStorage.getItem("user_token");
        if (token) {
          xhr.setRequestHeader("Authorization", "Bearer " + token);
          xhr.setRequestHeader("Authentication", token);
        }
      },
      success: function () {
        alert("Appointment confirmed.");
        loadBookings(getUser());
      },
      error: function (xhr) {
        const msg = xhr.responseJSON?.error || xhr.responseText || xhr.statusText;
        alert("Error confirming: " + msg);
      }
    });
  });

  // Expose loader functions globally so inline scripts can find them
  window.loadHome = loadHome;
  window.loadBooking = loadBooking;
  window.loadManageBookings = loadManageBookings;
  window.loadAdminBookings = loadAdminBookings;
  window.loadEditProfessors = loadEditProfessors;
  window.loadMaterialsPage = loadMaterialsPage;
  window.loadMessages = loadMessages;
  // If returning user, build menu and show navbar before routing
  if (localStorage.getItem("user_token")) {
    UserService.generateMenu();
    $("#navbar").show();
  }
  app.run();
  updateNavigation();



});

// Bulletproof login submit handler
$(document).off('submit', '#login-form').on('submit', '#login-form', function(e) {
  e.preventDefault();
  // Defensive: Always log what you read!
  const email = $('#email').val();
  const password = $('#password').val();

  // DEBUG: Show what we actually get
  console.log("Login attempt:", { email, password });

  // Defensive: Prevent sending blank!
  if (!email || !password) {
    alert("Please enter both email and password.");
    return;
  }

  $.ajax({
    url: 'http://localhost/MonaOmeragic/Web-programming/backend/auth/login',
    method: 'POST',
    contentType: 'application/json',
    data: JSON.stringify({ email, password }),
    success(result) {
      // Defensive: Always log the backend result
      console.log("Login success:", result);
      // Store token, decode user, and route
      localStorage.setItem('user_token', result.token || result.data?.token);
      const token = result.token || result.data?.token;
      const user = token ? JSON.parse(atob(token.split('.')[1])).user : null;

      if (!user) {
        alert("Login failed: Invalid token.");
        return;
      }

      if (user.role === 'admin') {
        window.location.hash = '#manage-users';
      } else if (user.role === 'professor') {
        window.location.hash = '#manage-bookings';
      } else {
        window.location.hash = '#home';
      }

      setTimeout(() => {
        window.dispatchEvent(new Event("hashchange"));
        updateNavigation();
        $("#navbar").show();
      }, 150);
    },
    error(xhr, status, error) {
      console.error('Login error:', status, error, xhr.responseText);
      const msg = xhr.responseJSON?.error || xhr.responseText || xhr.statusText;
      alert('Login failed: ' + msg);
    }
  });
});

// Signup form submission (delegated, student only)
$(document).off('submit', '#signup-form').on('submit', '#signup-form', function(e) {
  e.preventDefault();
  console.log('Signup form submitted');  // DEBUG

  const username = $('#signupUsername').val();
  const email    = $('#signupEmail').val();
  const password = $('#signupPassword').val();

  const url = 'http://localhost/MonaOmeragic/Web-programming/backend/auth/register';
  console.log('Posting to:', url, { username, email, password });  // DEBUG

  $.ajax({
    url: url,
    method: 'POST',
    contentType: 'application/json',
    data: JSON.stringify({ username, email, password, role: "student" }),
    success() {
      console.log('Signup success');
      alert('Registration successful! Please log in.');
      window.location.hash = '#login';
    },
    error(xhr) {
      console.error('Signup error', xhr);
      const msg = xhr.responseJSON?.error || xhr.responseText || xhr.statusText;
      alert('Signup failed: ' + msg);
    }
  });
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
  const id = $(this).data("id");

  if (!confirm("Are you sure you want to delete this user?")) return;

  $.ajax({
    url: `http://localhost/MonaOmeragic/Web-programming/backend/users/${id}`,
    method: "DELETE",
    beforeSend: function (xhr) {
      const token = localStorage.getItem("user_token");
      if (token) {
        xhr.setRequestHeader("Authorization", "Bearer " + token);
        xhr.setRequestHeader("Authentication", token);
      }
    },
    success: function () {
      alert("User deleted successfully from the database!");
      $(`#editProfessorsList .delete-user[data-id='${id}']`).closest('.user-card').remove();
      // Optionally refresh list if you want the filter to reapply:
      // setTimeout(loadEditProfessors, 250);
    },
    error: function (xhr) {
      const msg = xhr.responseJSON?.error || xhr.statusText;
      alert("Error deleting user: " + msg);
    }
  });
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
  $.ajax({
    url: "http://localhost/MonaOmeragic/Web-programming/backend/users",
    method: "GET",
    beforeSend: function(xhr) {
      const token = localStorage.getItem("user_token");
      if (token) {
        xhr.setRequestHeader("Authorization", "Bearer " + token);
        xhr.setRequestHeader("Authentication", token);
      }
    },
    success: function(users) {
      users.forEach(u => {
        if (typeof u.subjects === "string") {
          u.subjects = [u.subjects];
        } else if (!Array.isArray(u.subjects)) {
          u.subjects = [];
        }
      });
      users.forEach((u, index) => {
        if (u.role !== "admin") {
          usersList.append(`
            <div class="user-card">
              <p><strong>Name:</strong> ${u.username || u.name}</p>
              <p><strong>Email:</strong> ${u.email}</p>
              <p><strong>Role:</strong> ${u.role}</p>
              <p><strong>Subjects:</strong> ${
                Array.isArray(u.subjects)
                  ? u.subjects.join(', ')
                  : (typeof u.subjects === "string" && u.subjects.length)
                    ? u.subjects
                    : "N/A"
              }</p>
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
              <p><strong>Subjects:</strong> ${
                Array.isArray(staff.subjects)
                  ? staff.subjects.join(', ')
                  : (typeof staff.subjects === "string" && staff.subjects.length)
                    ? staff.subjects
                    : "N/A"
              }</p>
              <button class="delete-user btn btn-danger" data-index="${index}">Delete</button>
            </div>
          `);
        });
      } else {
        usersList.append("<p>No professors or assistants added yet.</p>");
      }
    },
    error: function(xhr) {
      const msg = xhr.responseJSON?.error || xhr.statusText;
      alert("Error loading users: " + msg);
    }
  });
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

  const newUser = {
    username: name,
    email,
    password,
    role,
    subjects: [subject]
  };

  console.log("📦 Submitting user:", newUser);
  console.log("🔐 Sending token:", localStorage.getItem("user_token"));

  $.ajax({
    url: 'http://localhost/MonaOmeragic/Web-programming/backend/users',
    method: 'POST',
    contentType: 'application/json',
    data: JSON.stringify(newUser),
    beforeSend: function(xhr) {
      const token = localStorage.getItem("user_token");
      if (token) {
        xhr.setRequestHeader("Authorization", "Bearer " + token);
        xhr.setRequestHeader("Authentication", token);
      }
    },
    success: function () {
      alert("User added successfully and saved to the database!");
      $("#addUserForm")[0].reset();
      window.location.hash = "#edit-professors";
      loadEditProfessors();
    },
    error: function (xhr) {
      const msg = xhr.responseJSON?.error || xhr.statusText;
      alert("Error adding user: " + msg);
    }
  });
});

// Cancel or delete an appointment
$(document).on("click", ".delete-booking", function () {
  const id = Number($(this).data("id"));
  if (!id) {
    alert("Unable to determine appointment ID.");
    return;
  }
  if (!confirm("Are you sure you want to cancel this appointment?")) return;

  $.ajax({
    url: `http://localhost/MonaOmeragic/Web-programming/backend/appointments/${id}`,
    method: "DELETE",
    beforeSend(xhr) {
      const tk = localStorage.getItem("user_token");
      if (tk) {
        xhr.setRequestHeader("Authorization", "Bearer " + tk);
        xhr.setRequestHeader("Authentication", tk);
      }
    },
    complete(xhr) {
      const response = xhr.responseJSON || {};
      const msg =
        response.message ||
        response.error ||
        xhr.responseText ||
        xhr.statusText;

      if (
        xhr.status === 200 ||
        xhr.status === 204 ||
        (typeof msg === "string" && msg.toLowerCase().includes("appointment deleted successfully"))
      ) {
        alert("Appointment cancelled successfully.");
        $(`[data-id='${id}']`).closest(".booking-card").remove();
        if (typeof populateTimeDropdown === "function" && window.location.hash === "#booking") {
          populateTimeDropdown();
        }
      } else {
        alert("Error cancelling appointment: " + msg);
      }
    }
  });
});

$(document).on("click", ".send-message-btn", function () {
  const $card = $(this).closest(".booking-card");
  $card.find(".message-input, .send-message-submit").show();
});

$(document).off("click", ".send-message-submit").on("click", ".send-message-submit", async function () {
  const $card = $(this).closest(".booking-card");
  const message = $card.find(".message-input").val();
  const studentId = $card.find(".send-message-btn").data("student-id");
  if (!message.trim()) {
    alert("Please write a message.");
    return;
  }
  if (!studentId) {
    alert("Student ID not found!");
    return;
  }
  const professor = getUser();
  try {
    await $.ajax({
      url: "http://localhost/MonaOmeragic/Web-programming/backend/messages",
      method: "POST",
      contentType: "application/json",
      data: JSON.stringify({
        from_user_id: professor.id,
        to_user_id: studentId,
        content: message,
      }),
      beforeSend: function(xhr) {
        const token = localStorage.getItem("user_token");
        if (token) {
          xhr.setRequestHeader("Authorization", "Bearer " + token);
          xhr.setRequestHeader("Authentication", token);
        }
      }
    });
    alert("Message sent successfully.");
    $card.find(".message-input").val("").hide();
    $card.find(".send-message-submit").hide();
  } catch (err) {
    alert("Error sending message: " + (err.responseText || err.statusText || err.message));
  }
});


function createSession() {
  // Attempt to get each form input by its expected ID
  const titleInput       = document.getElementById('sessionTitle');
  const descriptionInput = document.getElementById('sessionDescription');
  const timeInput        = document.getElementById('sessionTime');
  const capacityInput    = document.getElementById('sessionMax');
  const user             = getUser();

  // If any input is missing, log an error and abort
  if (!titleInput || !descriptionInput || !timeInput || !capacityInput) {
    console.error('One or more createSession form fields not found:', {
      sessionTitle: titleInput,
      sessionDescription: descriptionInput,
      sessionTime: timeInput,
      sessionMax: capacityInput
    });
    alert('Form fields are not correctly set up. Please check the Live Session form.');
    return;
  }

  // Read values
  const title       = titleInput.value.trim();
  const description = descriptionInput.value.trim();
  const time        = timeInput.value;
  const capacity    = parseInt(capacityInput.value, 10);

  // Validate presence
  if (!title || !description || !time || isNaN(capacity)) {
    alert('Please fill in all session fields.');
    return;
  }

  // Build session data
  const sessionData = {
    professor_id:   user ? user.id : null,
    title:          title,
    description:    description,
    scheduled_time: time,
    max_students:   capacity
  };

  // Call backend to create session
  LiveSessionService.create(
    sessionData,
    res => {
      alert(res.message || 'Session created.');
      // Reload the sessions list
      displaySessions();
    },
    err => {
      console.error('Error creating session:', err);
      alert(err || 'Failed to create session.');
    }
  );
}

function displaySessions() {
  const sessionsContainer = document.getElementById('sessionsContainer');
  if (!sessionsContainer) return;

  // Show a loading message while fetching
  sessionsContainer.innerHTML = '<p>Loading sessions…</p>';

  LiveSessionService.list(
    sessions => {
      sessionsContainer.innerHTML = ''; // clear previous contents

      const user = getUser();
      const isProfessor = user && user.role === 'professor';
      const isStudent   = user && user.role === 'student';

      // Heading text differs for professor vs. student
      const heading = document.createElement('h3');
      heading.classList.add('mb-3');
      heading.textContent = isProfessor
        ? "Upcoming My Sessions"
        : "Upcoming Live Sessions";
      sessionsContainer.appendChild(heading);

      if (!Array.isArray(sessions) || sessions.length === 0) {
        const noSess = document.createElement('p');
        noSess.textContent = 'No upcoming sessions.';
        sessionsContainer.appendChild(noSess);
        return;
      }

      sessions.forEach(session => {
        // Professors only see their own sessions
        if (isProfessor && session.professor_id !== user.id) return;

        const card = document.createElement('div');
        card.className = 'card p-3 mb-3 shadow-sm';

        // Format date/time
        const dt   = new Date(session.scheduled_time);
        const time = dt.toLocaleString();

        // Compute remaining seats = max_students minus how many have already RSVP’d
        const attending    = session.attendee_count || 0;
        const remaining = session.max_students - attending;

        // Build inner HTML, including professor_name
        card.innerHTML = `
          <h5 class="card-title">${session.title}</h5>
          <p class="mb-1"><strong>Time:</strong> ${time}</p>
          <p class="mb-1"><strong>Description:</strong> ${session.description}</p>
          <p class="mb-1"><strong>Professor:</strong> ${session.professor_name || session.professor_id}</p>
          <p class="mb-2 max-students"><strong>Remaining Seats:</strong> ${remaining}</p>
        `;

        // ─── Student “Attend / Cancel” button ────────────────────────────────────
        if (isStudent) {
          const token = localStorage.getItem('user_token');
          // Track in localStorage which sessions this student has clicked
          let localRSVP = JSON.parse(localStorage.getItem("attendedSessions") || "[]");
          const hasAttended = localRSVP.includes(session.id);

          const btn = document.createElement('button');
          btn.className = 'btn btn-primary';
          btn.textContent = hasAttended ? 'Cancel' : 'Attend';
          // If not yet attended, disable when no seats remain
          btn.disabled = (!hasAttended && remaining < 1);

          btn.onclick = async () => {
            try {
              const url =
                `http://localhost/MonaOmeragic/Web-programming/backend/live_sessions/${session.id}/attend`;

              if (hasAttended) {
                // Cancel RSVP
                await fetch(url, {
                  method: 'DELETE',
                  headers: {
                    'Authorization': 'Bearer ' + token,
                    'Authentication': token
                  }
                });
                localRSVP = localRSVP.filter(id => id !== session.id);
              } else {
                // RSVP (Attend)
                await fetch(url, {
                  method: 'POST',
                  headers: {
                    'Authorization': 'Bearer ' + token,
                    'Authentication': token
                  }
                });
                localRSVP.push(session.id);
              }
              localStorage.setItem("attendedSessions", JSON.stringify(localRSVP));
              displaySessions(); // Refresh so that attendee_count and button update
            } catch (err) {
              alert("Error updating attendance: " + (err.message || err));
            }
          };

          const btnWrap = document.createElement('div');
          btnWrap.classList.add('mt-2');
          btnWrap.appendChild(btn);
          card.appendChild(btnWrap);
        }

        // ─── Professor “Delete” button ───────────────────────────────────────────
        if (isProfessor) {
          const delBtn = document.createElement('button');
          delBtn.className = 'btn btn-outline-danger';
          delBtn.textContent = 'Delete';
          delBtn.onclick = () => {
            fetch(
              `http://localhost/MonaOmeragic/Web-programming/backend/live_sessions/${session.id}`,
              {
                method: 'DELETE',
                headers: {
                  'Authorization': 'Bearer ' + localStorage.getItem('user_token'),
                  'Authentication': localStorage.getItem('user_token')
                }
              }
            ).then(res => {
              if (res.ok) {
                displaySessions();
              } else {
                alert('Failed to delete session.');
              }
            });
          };
          const delWrap = document.createElement('div');
          delWrap.classList.add('mt-2');
          delWrap.appendChild(delBtn);
          card.appendChild(delWrap);
        }

        sessionsContainer.appendChild(card);
      });
    },
    err => {
      sessionsContainer.innerHTML = '<p class="text-danger">Failed to load sessions.</p>';
    }
  );
}
// Add session form handler and initial session display
document.addEventListener('DOMContentLoaded', () => {
  const sessionForm = document.getElementById('sessionForm');
  if (sessionForm) {
    sessionForm.addEventListener('submit', function(e) {
      e.preventDefault();
      createSession();
    });
  }
  if (document.getElementById('sessionsContainer')) {
    displaySessions();
  }
});

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

// Show stored live sessions
async function loadMessages() {
  const user = getUser();
  if (!user) return;
  console.log("loadMessages - user:", user);

  // Show/hide sections based on role
  const studentSection = document.getElementById('studentMessagesSection');
  const professorSection = document.getElementById('professorMessagesSection');
  if (user.role && user.role.toLowerCase() === 'student') {
    if (studentSection) studentSection.style.display = 'block';
    if (professorSection) professorSection.style.display = 'none';
  } else if (user.role && (user.role.toLowerCase() === 'professor' || user.role.toLowerCase() === 'assistant')) {
    if (studentSection) studentSection.style.display = 'none';
    if (professorSection) professorSection.style.display = 'block';
  } else {
    if (studentSection) studentSection.style.display = 'none';
    if (professorSection) professorSection.style.display = 'none';
  }

  const containerId = (user.role && user.role.toLowerCase() === 'student')
    ? 'studentMessages'
    : 'professorMessages';
  const container = document.getElementById(containerId);
  console.log("loadMessages - containerId:", containerId, "container exists:", !!container);
  if (!container) return;

  container.innerHTML = '<p>Loading messages...</p>';

  try {
    // Step 1: Fetch all users and build a map of user IDs to emails
    let userMap = {};
    try {
      const users = await $.ajax({
        url: "http://localhost/MonaOmeragic/Web-programming/backend/users",
        method: "GET",
        beforeSend: function(xhr) {
          const token = localStorage.getItem("user_token");
          if (token) {
            xhr.setRequestHeader("Authorization", "Bearer " + token);
            xhr.setRequestHeader("Authentication", token);
          }
        }
      });
      (users || []).forEach(u => {
        userMap[u.id] = u.email;
      });
    } catch (userErr) {
      // If user fetch fails, fallback to empty map
      userMap = {};
    }

    let messages = [];

    if (user.role && user.role.toLowerCase() === 'student') {
      // Student: load messages sent to them
      messages = await $.ajax({
        url: "http://localhost/MonaOmeragic/Web-programming/backend/messages",
        method: "GET",
        beforeSend: function(xhr) {
          const token = localStorage.getItem("user_token");
          if (token) {
            xhr.setRequestHeader("Authorization", "Bearer " + token);
            xhr.setRequestHeader("Authentication", token);
          }
        }
      });
    } else if (user.role && (user.role.toLowerCase() === 'professor' || user.role.toLowerCase() === 'assistant')) {
      // Professor/Assistant: load messages they sent
      messages = await $.ajax({
        url: "http://localhost/MonaOmeragic/Web-programming/backend/messages",
        method: "GET",
        beforeSend: function(xhr) {
          const token = localStorage.getItem("user_token");
          if (token) {
            xhr.setRequestHeader("Authorization", "Bearer " + token);
            xhr.setRequestHeader("Authentication", token);
          }
        }
      });
    } else {
      container.innerHTML = '<p>No messages available.</p>';
      return;
    }
    console.log("loadMessages - fetched messages:", messages);

    container.innerHTML = '';
    if (!messages || messages.length === 0) {
      container.innerHTML = '<p>No messages yet.</p>';
      return;
    }

    messages.forEach(msg => {
      const messageCard = document.createElement('div');
      messageCard.className = 'message-card border p-3 mb-3 rounded bg-light';
      // For student, "From" is professor; for professor, "To" is student (show email)
      if (user.role && user.role.toLowerCase() === 'student') {
        messageCard.innerHTML = `
          <p><strong>From:</strong> ${userMap[msg.from_user_id] || msg.from_user_id}</p>
          <p><strong>Message:</strong> ${msg.content}</p>
          <p class="text-muted"><small>${new Date(msg.created_at).toLocaleString()}</small></p>
          <button class="mark-read btn btn-success btn-sm" data-id="${msg.id}">Mark as Read</button>
        `;
      } else {
        messageCard.innerHTML = `
          <p><strong>To Student:</strong> ${userMap[msg.to_user_id] || msg.to_user_id}</p>
          <p><strong>Message:</strong> ${msg.content}</p>
          <p class="text-muted"><small>${new Date(msg.created_at).toLocaleString()}</small></p>
        `;
      }
      container.appendChild(messageCard);
    });

    if (user.role && user.role.toLowerCase() === 'student') {
      container.querySelectorAll('.mark-read').forEach(btn => {
        btn.onclick = async function () {
          const msgId = this.getAttribute('data-id');
          try {
            await $.ajax({
              url: "http://localhost/MonaOmeragic/Web-programming/backend/messages/" + msgId + "/read",
              method: "POST",
              beforeSend: function(xhr) {
                const token = localStorage.getItem("user_token");
                if (token) {
                  xhr.setRequestHeader("Authorization", "Bearer " + token);
                  xhr.setRequestHeader("Authentication", token);
                }
              }
            });
            this.parentElement.style.display = 'none';
          } catch (err) {
            alert("Failed to mark as read: " + err.message);
          }
        }
      });
    }
  } catch (err) {
    container.innerHTML = '<p class="text-danger">Failed to load messages.</p>';
  }
}



