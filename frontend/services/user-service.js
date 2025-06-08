// Assumes Utils and Constants are loaded globally before this script.
const UserService = {
    initLogin() {
      const token = localStorage.getItem("user_token");
      if (token) {
        // If there's no existing fragment (or it's just "#"), set default by role
        const currentHash = window.location.hash;
        if (!currentHash || currentHash === "#") {
          const role = Utils.parseJwt(token)?.user?.role;
          if (role === Constants.ADMIN_ROLE) {
            window.location.hash = "#manage-users";
          } else if (
            role === Constants.PROFESSOR_ROLE ||
            role === Constants.ASSISTANT_ROLE
          ) {
            window.location.hash = "#manage-bookings";
          } else {
            // Students or others could be directed elsewhere, e.g. "#home"
            // window.location.hash = "#home";
          }
        }
        return;
      }
      // Bind login submission without needing jquery.validate
      $(document).off('submit', '#login-form').on('submit', '#login-form', function(e) {
        e.preventDefault();
        const creds = Object.fromEntries(new FormData(this).entries());
        UserService.login(creds);
      });
    },
    login(credentials) {
      $.ajax({
        url: Constants.PROJECT_BASE_URL + "/auth/login",
        type: "POST",
        data: JSON.stringify(credentials),
        contentType: "application/json",
        dataType: "json",
        success(result) {
          const token = result.data.token;
          localStorage.setItem("user_token", token);

          // Immediately show navbar and render menu
          UserService.generateMenu();
          $("#navbar").show();

          // Determine target hash based on role
          const role = Utils.parseJwt(token)?.user?.role;
          let targetHash = "#home";
          if (role === Constants.ADMIN_ROLE) {
            targetHash = "#manage-users";
          } else if (
            role === Constants.PROFESSOR_ROLE ||
            role === Constants.ASSISTANT_ROLE
          ) {
            targetHash = "#manage-bookings";
          }
          // If not already in index.html shell, load it
          if (!window.location.pathname.endsWith("index.html")) {
            window.location.href = "index.html" + targetHash;
          } else {
            window.location.hash = targetHash;
          }
        },
        error(xhr) {
          toastr.error(xhr.responseText || xhr.responseJSON?.message || "Login failed");
        }
      });
    },
  /**
   * Perform user registration (students only).
   * @param {{ username: string, email: string, password: string }} credentials
   */
  register(credentials) {
    $.ajax({
      url: Constants.PROJECT_BASE_URL + '/index.php?url=/auth/register',
      type: 'POST',
      data: JSON.stringify(credentials),
      contentType: 'application/json',
      dataType: 'json',
      success() {
        toastr.success('Registration successful! Please log in.');
        window.location.hash = '#login';
      },
      error(xhr) {
        const msg = xhr.responseJSON?.error || xhr.responseText || 'Signup failed';
        toastr.error(msg);
      }
    });
  },
    logout() {
      localStorage.clear();
      window.location.hash = "#login";
    },
    generateMenu() {
      const jwt   = localStorage.getItem("user_token");
      const user  = Utils.parseJwt(jwt)?.user;
      if (!user?.role) return window.location.hash = "#login";
  
      let tabs = "", main = "";
  
      // example for student role
      if (user.role === Constants.USER_ROLE) {
        tabs += `<li><a href="#home">Home</a></li>`;
        tabs += `<li><a href="#manage-bookings">My Appointments</a></li>`;
        tabs += `<li><a href="#booking">Book Session</a></li>`;
        tabs += `<li><a href="#live-session">Live Sessions</a></li>`;
        tabs += `<li><a href="#messages">Messages</a></li>`;
        tabs += `<li><a href="#math-materials">Math Materials</a></li>`;
        tabs += `<li><a href="#physics-materials">Physics Materials</a></li>`;
        tabs += `<li><a href="#computer-science-materials">CS Materials</a></li>`;
        tabs += `<li><a href="#chemistry-materials">Chemistry Materials</a></li>`;
        tabs += `<li><button onclick="UserService.logout()">Logout</button></li>`;
        main += `<section id="home" data-load="home.html"></section>`;
        main += `<section id="manage-bookings" data-load="manage-bookings.html"></section>`;
        main += `<section id="booking" data-load="booking.html"></section>`;
        main += `<section id="live-session" data-load="live-session.html"></section>`;
        main += `<section id="messages" data-load="messages.html"></section>`;
        main += `<section id="math-materials" data-load="math-materials.html"></section>`;
        main += `<section id="physics-materials" data-load="physics-materials.html"></section>`;
        main += `<section id="computer-science-materials" data-load="computer-science-materials.html"></section>`;
        main += `<section id="chemistry-materials" data-load="chemistry-materials.html"></section>`;
      }
      // you can add other roles similarly…
  
      if (user.role === Constants.ADMIN_ROLE) {
        tabs += `<li><a href="#manage-users">Add Professors/Assistants</a></li>`;
        tabs += `<li><a href="#edit-professors">Edit Professors/Assistants</a></li>`;
        tabs += `<li><a href="#admin-bookings">All Bookings</a></li>`;
        tabs += `<li><button onclick="UserService.logout()">Logout</button></li>`;

        main += `<section id="manage-users" data-load="manage-users.html"></section>`;
        main += `<section id="edit-professors" data-load="edit-professors.html"></section>`;
        main += `<section id="admin-bookings" data-load="admin-bookings.html"></section>`;
      }

      if (user.role === Constants.PROFESSOR_ROLE || user.role === Constants.ASSISTANT_ROLE) {
        tabs += `<li><a href="#manage-bookings">Manage Bookings</a></li>`;
        tabs += `<li><a href="#messages">Messages</a></li>`;
        tabs += `<li><a href="#live-session">Live Sessions</a></li>`;
        tabs += `<li><a href="#math-materials">Math Materials</a></li>`;
        tabs += `<li><a href="#physics-materials">Physics Materials</a></li>`;
        tabs += `<li><a href="#computer-science-materials">CS Materials</a></li>`;
        tabs += `<li><a href="#chemistry-materials">Chemistry Materials</a></li>`;
        tabs += `<li><button onclick="UserService.logout()">Logout</button></li>`;

        main += `<section id="manage-bookings" data-load="manage-bookings.html"></section>`;
        main += `<section id="messages" data-load="messages.html"></section>`;
        main += `<section id="live-session" data-load="live-session.html"></section>`;
        main += `<section id="math-materials" data-load="math-materials.html"></section>`;
        main += `<section id="physics-materials" data-load="physics-materials.html"></section>`;
        main += `<section id="computer-science-materials" data-load="computer-science-materials.html"></section>`;
        main += `<section id="chemistry-materials" data-load="chemistry-materials.html"></section>`;
      }
  
      $("#tabs").html(tabs);
      $("#spapp").html(main);
    },
    initSignup() {
      // Bind signup submission
      $(document).off('submit', '#signup-form').on('submit', '#signup-form', function(e) {
        e.preventDefault();
        const creds = Object.fromEntries(new FormData(this).entries());
        // force student role
        creds.role = 'student';
        UserService.register(creds);
      });
    },
  };

  // Initialize login and signup form bindings on document ready
  $(document).ready(() => {
    UserService.initLogin();
    UserService.initSignup();
    // If already logged in, ensure navbar is visible and menu is rendered
    const existingToken = localStorage.getItem("user_token");
    if (existingToken) {
      UserService.generateMenu();
      $("#navbar").show();
    }
  });

// Expose UserService globally for access from non-module scripts
window.UserService = UserService;