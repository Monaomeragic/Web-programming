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

  let app = $.spapp({ pageNotFound: 'error_404' });

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
      $("#homeNav, #bookingNav, #manageBookingsNav, #messagesNav, #materialsDropdown, #liveSessionsNav").show();
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
  app.route({ view: 'home', load: 'home.html', onReady: function () { loadHome(); updateNavigation(); } });
  app.route({ view: 'manage-bookings', load: 'manage-bookings.html', onReady: function () { loadManageBookings(); updateNavigation(); } });
  app.route({ view: 'booking', load: 'booking.html', onReady: loadBooking });
  app.route({ view: 'math-materials', load: 'math-materials.html', onReady: () => loadMaterialsPage("Mathematics") });
  app.route({ view: 'physics-materials', load: 'physics-materials.html', onReady: () => loadMaterialsPage("Physics") });
  app.route({ view: 'computer-science-materials', load: 'computer-science-materials.html', onReady: () => loadMaterialsPage("Computer Science") });
  app.route({ view: 'chemistry-materials', load: 'chemistry-materials.html', onReady: () => loadMaterialsPage("Chemistry") });
  app.route({ view: 'manage-users', load: 'manage-users.html', onReady: function () { loadUserManagement(); updateNavigation(); } });
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
  // Upload material handler
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
                      <button class="btn btn-outline-primary send-message-btn " data-student="${booking.studentName}">Message</button>
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
          loadMaterialsPage(newSubject);
      }
  });
  app.run();
  updateNavigation();

});

// Login form submission (delegated)
$(document).on('submit', '#login-form', function(e) {
  e.preventDefault();
  const email = $('#loginEmail').val();
  const password = $('#loginPassword').val();
  $.ajax({
    url: 'http://localhost/MonaOmeragic/Web-programming/backend/auth/login',
    method: 'POST',
    contentType: 'application/json',
    data: JSON.stringify({ email, password }),
    success(result) {
      localStorage.setItem('user_token', result.data.token);
      const user = JSON.parse(atob(result.data.token.split('.')[1])).user;

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

// Show stored live sessions
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

// Load messages when navigating to the messages page
window.addEventListener("hashchange", () => {
  if (window.location.hash === "#messages") {
    loadMessages();
  }
});

