/* jshint browser: true */
(function() {
  "use strict";
  /**
   * Confirm this is a nav menu item.
   *
   * @returns {Boolean} True if a nav item.
   */
  function isNavItem(id) {
    return /^menu-(?:\w+?)$/.test(id);
  }

  /**
   * Hide the current menu.
   */
  function hideNavMenu() {
    var menuVisible = document.querySelector(".menu-context.visible");
    var menuActive = document.querySelector(".menu .active");

    // Hide the currently visible menu
    if (menuVisible) {
      menuVisible.classList.remove("visible");
    }

    // Un-highlight the current nav item
    if (menuActive) {
      menuActive.classList.remove("active");
    }
  }

  var menusAreVisible = false,
      Qbody = document.querySelector("body"),
      Qmenu = document.querySelector(".menu"),
      QtextArea = document.querySelector("textarea");

  Qmenu.addEventListener("mouseover", function(e) {
    // Make sure we are on a nav item
    if (isNavItem(e.target.id)) {
      hideNavMenu();

      // Only display the menus if we are allowed to
      if (menusAreVisible) {
        // Display the currently hovered-over menu
        var contextMenu = e.target.id.match(/^menu-(\w+?)$/)[1];
        document.querySelector(".menu-context." +  contextMenu).classList.add("visible");
        e.target.classList.add("active");
      }
    }
  });

  Qmenu.addEventListener("click", function(e) {
    // Close the menu if the label is clicked again
    if (isNavItem(e.target.id) && menusAreVisible) {
      menusAreVisible = false;
      hideNavMenu();
      return;
    }

    // Make sure the desired menu is not already visible
    if (isNavItem(e.target.id) && !e.target.classList.contains("visible")) {
      // Menus are allowed to be shown
      menusAreVisible = true;

      // Display the desired menu
      var contextMenu = e.target.id.match(/^menu-(\w+?)$/)[1];
      document.querySelector(".menu-context." +  contextMenu).classList.add("visible");
      e.target.classList.add("active");
    }
   });

  Qbody.addEventListener("click", function(e) {
    if (!isNavItem(e.target.id) && !e.target.classList.contains("menu-disabled") &&
        !e.target.classList.contains("blank")) {
      // Menus are not allowed to be shown at this time
      if (menusAreVisible) {
        menusAreVisible = false;
        hideNavMenu();
      }
    }
  });


  var Notepad = (function() {
    var self = null;

    /**
     * Get the class of the current theme.
     *
     * @private
     * @returns {String}
     */
    function __getCurrentTheme(body) {
      return body.className.match(/^win\d{1,2}$/)[0];
    }

    /**
     * Create a Notepad API instance.
     *
     * @constructs Notepad
     * @param {Object} ele - [[Description]]
     */
    function Notepad(ele) {
      this.fileName = "Note.txt";
      this.ele = ele;
      this.wordWrap = false;
      this.statusBar = false;
      self = this;
    }

    /**
     * Create a new file.
     */
    Notepad.prototype.fileNew = function() {
      self.ele.textarea.value = "";
      self.ele.textarea.focus();
    };

    /**
     * Save the document to the computer.
     */
    Notepad.prototype.fileSave = function() {
      // Create a blob object of the contents
      var blob = new Blob([self.ele.textarea.value], {type: "text/plain"});

      // Internet Explorer/MS Edge
      if (window.navigator.msSaveOrOpenBlob) {
        window.navigator.msSaveOrOpenBlob(blob, self.fileName);

      // All other browsers
      } else {
        // Create the download link
        var saveLink = document.createElement("a");
        saveLink.style.display = "none";
        saveLink.setAttribute("href", URL.createObjectURL(blob));
        saveLink.setAttribute("download", self.fileName);
        self.ele.body.appendChild(saveLink);

        // Start the download and remove the link
        saveLink.click();
        self.ele.body.removeChild(saveLink);
      }
    };

    /**
     * Save a document to the computer using a custom file name.
     */
    Notepad.prototype.fileSaveAs = function() {
      var newName = prompt("Enter the desired file name").trim();

      // Do not permit a blank name
      if (!/^\s*$/.test(newName)) {
        self.fileName = newName + ".txt";
      }
      self.fileSave();
    };

    /**
     * Print the current document.
     */
    Notepad.prototype.filePrint = function() {
      window.print();
    };

    /**
     * Insert the current time and date into the document
     * at the current cursor position.
     */
    Notepad.prototype.editTimeDate = function() {
      var date = new Date(),
          curHour = date.getHours(),
          curMin  = date.getMinutes(),
          timeOfDay = curHour > 11 ? "PM" : "AM",
          cursorPos = self.ele.textarea.selectionStart;

      // Midnight
      if (curHour === 0) {
        curHour = "12";

        // Afternoon
      } else if (curHour > 11) {
        curHour -= 12;
      }

      // Pretty print the minutes
      if (curMin < 10) {
        curMin = "0" + curMin;
      }

      // Construct the formatted string
      var dateString = curHour + ":" + curMin + " " + timeOfDay + " " +
                       date.toLocaleDateString();

      // Update the document with the date string
      var front = self.ele.textarea.value.substring(0, cursorPos),
          back  = self.ele.textarea.value.substring(cursorPos, self.ele.textarea.length);

      // Insert the date string into the document
      self.ele.textarea.value = front + dateString + back;
      self.ele.textarea.selectionStart = cursorPos;
      self.ele.textarea.selectionEnd = cursorPos;
      self.ele.textarea.focus();
    };

    /**
     * Toggle the status bar.
     */
    Notepad.prototype.toggleStatusBar = function() {
      // Word wrap must be disabled
      if (!self.wordWrap) {
        self.ele.areaEdit.classList.toggle("has-status-bar");
        self.ele.statusBar.classList.toggle("visible");
        self.statusBar = !self.statusBar;
      }
    };

    /**
     * Toggle word wrap.
     */
    Notepad.prototype.toggleWordWrap = function() {
      // We cannot have the status bar and word wrap enabled
      if (self.statusBar) {
        self.toggleStatusBar();
      }

      self.ele.textarea.classList.toggle("no-word-wrap");
      self.wordWrap = !self.wordWrap;
    };

    /**
     * Change the UI theme.
     *
     * @param {String} newTheme - The desired theme to use.
     * @returns {Boolean} True if the theme could be changed, false otherwise.
     */
    Notepad.prototype.changeTheme = function(newTheme) {
      var validThemes  = ["win7", "win10"],
          currentTheme = __getCurrentTheme(self.ele.body);

      // The desired theme is already applied or not available
      if (newTheme === currentTheme || validThemes.indexOf(newTheme) === -1) {
        return false;
      }

      // Apply the desired theme
      self.ele.body.classList.remove(currentTheme);
      self.ele.body.classList.add(newTheme);
      return true;
    };

    return Notepad;
  })();


  // Create a new Notepad API instance
  var notepad = new Notepad({
    body: document.querySelector("body"),
    areaEdit: document.querySelector("#area-edit"),
    textarea: QtextArea,
    statusBar: document.querySelector("#area-status-bar"),
  });

  // File > New command
  document.querySelector(".menu-context #action-new").addEventListener("click", notepad.fileNew);

  // File > Save command
  document.querySelector(".menu-context #action-save").addEventListener("click", notepad.fileSave);

  // File > Save As command
  document.querySelector(".menu-context #action-save-as").addEventListener("click", notepad.fileSaveAs);

  // File > Print command
  document.querySelector(".menu-context #action-print").addEventListener("click", notepad.filePrint);

  // Edit > Time/Date
  document.querySelector(".menu-context #action-time-date").addEventListener("click", notepad.editTimeDate);

  // Format > Word Wrap
  // Word wrap is disabled by default
  var QwordWrap = document.querySelector("input#word-wrap");
  QwordWrap.checked = false;
  QwordWrap.addEventListener("click", notepad.toggleWordWrap);

  // View > Status Bar
  // Status bar is disabled by default
  var QstatusBar = document.querySelector("input#status-bar");
  QstatusBar.checked = false;
  QstatusBar.addEventListener("click", notepad.toggleStatusBar);

  // View > Windows X
  var themeWin7  = document.querySelector(".menu-context input#theme-win7"),
      themeWin10 = document.querySelector(".menu-context input#theme-win10");

  // Default to the Windows 10 theme
  themeWin10.checked = true;
  themeWin7.onchange = themeWin10.onchange = function(e) {
    notepad.changeTheme(e.target.id.match(/^theme-(win\d{1,2})/)[1]);
  };
}());
