const applications = JSON.parse(localStorage.getItem("applications")) || [];
let editIndex = -1;
const companyInput = document.getElementById("company");
const roleInput = document.getElementById("job-role");
const locationInput = document.getElementById("location");
const statusInput = document.getElementById("status");
const dateInput = document.getElementById("dateApplied");
const notesInput = document.getElementById("notes");
const applicationSearch = document.getElementById("applicationSearch");

applicationForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const application = {
    company: companyInput.value,
    role: roleInput.value,
    location: locationInput.value,
    status: statusInput.value,
    dateApplied: dateInput.value,
    notes: notesInput.value,
  };
  if (editIndex === -1) {
    applications.push(application);
  } else {
    applications[editIndex] = application;
    editIndex = -1;
  }
  localStorage.setItem("applications", JSON.stringify(applications));

  displayApplications();
  updateStats();

  applicationForm.reset();
});
localStorage.setItem("applications", JSON.stringify(applications));

function updateStats() {
  const totalApplications = document.getElementById("totalApplications");
  const interviewCount = document.getElementById("interviewCount");
  const offerCount = document.getElementById("offerCount");
  const rejectedCount = document.getElementById("rejectedCount");

  totalApplications.textContent = applications.length;

  let applied = 0;
  let interview = 0;
  let offer = 0;
  let rejected = 0;

  applications.forEach(function (application) {
    if (application.status === "Applied") {
      applied++;
    } else if (application.status === "Interview") {
      interview++;
    } else if (application.status === "Offer") {
      offer++;
    } else if (application.status === "Rejected") {
      rejected++;
    }
  });

  interviewCount.textContent = interview;
  offerCount.textContent = offer;
  rejectedCount.textContent = rejected;

  statusChart.data.datasets[0].data = [applied, interview, offer, rejected];

  statusChart.update();

  const monthlyCounts = {};

  applications.forEach(function (application) {
    if (application.dateApplied) {
      const date = new Date(application.dateApplied);
      const monthYear = date.toLocaleString("default", {
        month: "short",
        year: "numeric",
      });

      if (!monthlyCounts[monthYear]) {
        monthlyCounts[monthYear] = 0;
      }
      monthlyCounts[monthYear]++;
    }
  });

  const labels = Object.keys(monthlyCounts);
  const data = Object.values(monthlyCounts);

  monthlyChart.data.labels = labels;
  monthlyChart.data.datasets[0].data = data;
  monthlyChart.update();
}

const tableBody = document.getElementById("applicationstablebody");

function displayApplications() {
  tableBody.innerHTML = "";
  const selectedStatus = statusFilter.value;
  const searchText = applicationSearch.value.toLowerCase();
  let sortedApplications = [...applications];
  const headerSearch = document.getElementById("headerSearch");
  if (sortFilter.value === "Newest First") {
    sortedApplications.sort(function (a, b) {
      return new Date(b.dateApplied) - new Date(a.dateApplied);
    });
  } else if (sortFilter.value === "Oldest First") {
    sortedApplications.sort(function (a, b) {
      return new Date(a.dateApplied) - new Date(b.dateApplied);
    });
  }
  sortedApplications.forEach(function (application, index) {
    if (
      selectedStatus !== "All Status" &&
      application.status !== selectedStatus
    ) {
      return;
    }
    if (
      searchText !== "" &&
      !application.company.toLowerCase().includes(searchText)
    ) {
      return;
    }

    const row = document.createElement("tr");
    row.innerHTML = `
    <td>${application.company}</td>
    <td>${application.role}</td>
    <td>${application.location}</td>
    <td>
        <span class="status ${application.status.toLowerCase()}">
            ${application.status}
        </span>
    </td>
    <td>${application.dateApplied}</td>
    <td>
        <button class="edit-btn" data-index="${index}">
            <i class="fa-solid fa-pen"></i>
        </button>

        <button class="delete-btn" data-index="${index}">
            <i class="fa-solid fa-trash"></i>
        </button>
    </td>
`;
    tableBody.appendChild(row);
    const deleteBtn = row.querySelector(".delete-btn");
    const editBtn = row.querySelector(".edit-btn");

    deleteBtn.addEventListener("click", function () {
      const index = deleteBtn.dataset.index;

      applications.splice(index, 1);

      localStorage.setItem("applications", JSON.stringify(applications));

      displayApplications();
      updateStats();
    });
    editBtn.addEventListener("click", function () {
      companyInput.value = application.company;
      roleInput.value = application.role;
      locationInput.value = application.location;
      statusInput.value = application.status;
      dateInput.value = application.dateApplied;
      notesInput.value = application.notes;

      editIndex = index;
    });
  });
}
const statusFilter = document.getElementById("aplstatus");

statusFilter.addEventListener("change", function () {
  displayApplications();
});
const sortFilter = document.getElementById("aplsort");
sortFilter.addEventListener("change", function () {
  displayApplications();
});
applicationSearch.addEventListener("input", function () {
  displayApplications();
});
const statusCtx = document.getElementById("statusChart");

const statusChart = new Chart(statusCtx, {
  type: "doughnut",

  data: {
    labels: ["Applied", "Interview", "Offer", "Rejected"],

    datasets: [
      {
        data: [0, 0, 0, 0],
      },
    ],
  },
});
const monthlyCtx = document.getElementById("monthlyChart");

const monthlyChart = new Chart(monthlyCtx, {
  type: "bar",
  data: {
    labels: [],
    datasets: [
      {
        label: "Applications per Month",
        data: [],
        backgroundColor: "rgba(54, 162, 235, 0.6)",
      },
    ],
  },
});
headerSearch.addEventListener("input", function () {
  applicationSearch.value = headerSearch.value;
  displayApplications();
});
const notificationWrapper = document.querySelector(".notification-wrapper");
const notificationPopup = document.getElementById("notificationPopup");

notificationWrapper.addEventListener("click", function (event) {
  event.stopPropagation();
  notificationPopup.classList.toggle("show");
});
document.addEventListener("click", function (event) {
  if (!notificationWrapper.contains(event.target)) {
    notificationPopup.classList.remove("show");
  }
});
const darkModeWrapper = document.querySelector(".dark-mode-wrapper");

darkModeWrapper.addEventListener("click", function () {
  document.body.classList.toggle("dark-mode");
});
displayApplications();
updateStats();
