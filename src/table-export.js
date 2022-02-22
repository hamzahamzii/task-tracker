import moment from "moment";
import timer from "@/timer.js";
export default {
  TaskTableExport: (data, name, format) => {
    let rows = [];
    for (let user of data) {
      let rowData = [];
      let get_members = user.members.map(k=>{
       return k.name ? k.name : k.email
      }).join("/")
      let time_spent = user.members.map(t=>{
        return t.duration  ? timer.format(
          t.duration
        )  :'00'
      }).join("/")
      get_members ? rowData.push(get_members) : '';
      user.assigned_by ? rowData.push(user.assigned_by.name) : rowData.push(user.assigned_by.email);
      user.project ? rowData.push(user.project.name) : 'no project';
      user.title ? rowData.push(user.title) : 'no-title';
      user.created_at ? rowData.push(user.created_at) : '';
      user.due_date ? rowData.push(user.due_date) : '';
      time_spent ? rowData.push(time_spent) : '00';      
      if (!user.length)
        rows.push([
          get_members ? get_members.toUpperCase():'',
          user.assigned_by ? user.assigned_by.name : rowData.user.assigned_by.email,
          user.project ? user.project.name.charAt(0).toUpperCase() + user.project.name.slice(1) : 'no project',
          user.title ? user.title.charAt(0).toUpperCase() + user.title.slice(1) : 'no title',
          user.created_at ? moment(user.created_at).format("DD-MM-YYYY") : '',
          user.due_date ?moment(user.due_date).format("DD-MM-YYYY") : '',
          time_spent ?time_spent: '00',
        ]);
    }

    var output_string = "Member,Assigned by, Project,Title,Assigned Date,Due Date, Time Spent\n";
    rows.forEach(function(row) {
      output_string += row.join(",");
      output_string += "\n";
    });

    // Download it
    var filename;
    var link = document.createElement("a");
    link.style.display = "none";
    link.setAttribute("target", "_blank");

    // For excel format
    if (format == "xls") {
      link.setAttribute(
        "href",
        "data:application/vnd.ms-excel;charset=utf-8," +
          encodeURIComponent(output_string)
      );
      filename = name + ".xls";
    }
    // For CSV format
    else if (format == "csv") {
      link.setAttribute(
        "href",
        "data:text/csv;charset=utf-8," + encodeURIComponent(output_string)
      );
      filename = name + ".csv";
    }
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  ActiveTeamMemberTableExport: (data, name, format) => {
    let rows = [];
    for (let active_member of data) {
      let rowData = [];
      active_member.name ? rowData.push(active_member.name) : rowData.push(active_member.email);
      active_member.email ? rowData.push(active_member.email) : rowData.push(active_member.email);
      active_member.role ? rowData.push(active_member.role) : 'no role';
      active_member.today_time ? rowData.push(active_member.today_time) : '00:00:00';
      active_member.weekly_time ? rowData.push(active_member.weekly_time) : '00:00:00';
      active_member.total_time ? rowData.push(active_member.total_time) : '00:00:00';
      active_member.completed ? rowData.push(active_member.completed) : '0';
      active_member.pending ? rowData.push(active_member.pending) : '0';
      active_member.overdue ? rowData.push(active_member.overdue) : '0';
       if (!active_member.length)
        rows.push([
          active_member.name ? active_member.name.charAt(0).toUpperCase() + active_member.name.slice(1)  : active_member.email,
          active_member.email ? active_member.email : 'no email',
          active_member.role ? active_member.role.charAt(0).toUpperCase() + active_member.role.slice(1)  : 'no role',
          active_member.today_time ? active_member.today_time : '00:00:00',
          active_member.weekly_time ? active_member.weekly_time : '00:00:00',
          active_member.total_time ? active_member.total_time : '00:00:00',
          active_member.completed  ? active_member.completed  : '0',
          active_member.pending ? active_member.pending : '0',
          active_member.overdue ? active_member.overdue : '0',
        ]);
    }

    var output_string = "Name, Email, Role,Today Hours,Weekly Hours ,Monthly Hours, Completed Task,Pending Tasks, Overdue Tasks\n";
    rows.forEach(function(row) {
      output_string += row.join(",");
      output_string += "\n";
    });

    // Download it
    var filename;
    var link = document.createElement("a");
    link.style.display = "none";
    link.setAttribute("target", "_blank");

    // For excel format
    if (format == "xlsx") {
      link.setAttribute(
        "href",
        "data:application/vnd.ms-excel;charset=utf-8," +
          encodeURIComponent(output_string)
      );
      filename = name + ".xlsx";
    }
    // For CSV format
    else if (format == "csv") {
      link.setAttribute(
        "href",
        "data:text/csv;charset=utf-8," + encodeURIComponent(output_string)
      );
      filename = name + ".csv";
    }
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  ArchiveTeamMemberTableExport: (data, name, format) => {
    let rows = [];
    for (let archive_member of data) {
      let rowData = [];
      archive_member.name ? rowData.push(archive_member.name) : rowData.push(archive_member.email);
      archive_member.email ? rowData.push(archive_member.email) : rowData.push(archive_member.email);
      archive_member.total_time ? rowData.push(archive_member.total_time) : '00:00:00';
      archive_member.joining_date ? rowData.push(archive_member.joining_date) : '';
      archive_member.resign_date ? rowData.push(archive_member.resign_date) : '';
      archive_member.last_working_date ? rowData.push(archive_member.last_working_date) : '';
       if (!archive_member.length)
        rows.push([
          archive_member.name ? archive_member.name.charAt(0).toUpperCase() + archive_member.name.slice(1)  : archive_member.email,
          archive_member.email ? archive_member.email : 'no email',
          archive_member.total_time ? archive_member.total_time : '00:00:00',
          archive_member.joining_date  ?  moment(archive_member.joining_date).format("DD-MM-YYYY"): '',
          archive_member.resign_date ? moment(archive_member.resign_date).format("DD-MM-YYYY"): '',
          archive_member.last_working_date ? moment(archive_member.last_working_date).format("DD-MM-YYYY"): '',
        ]);
    }

    var output_string = "Name, Email,Total Hours, Join Date,Resign Date, Last Working Date\n";
    rows.forEach(function(row) {
      output_string += row.join(",");
      output_string += "\n";
    });

    // Download it
    var filename;
    var link = document.createElement("a");
    link.style.display = "none";
    link.setAttribute("target", "_blank");

    // For excel format
    if (format == "xlsx") {
      link.setAttribute(
        "href",
        "data:application/vnd.ms-excel;charset=utf-8," +
          encodeURIComponent(output_string)
      );
      filename = name + ".xlsx";
    }
    // For CSV format
    else if (format == "csv") {
      link.setAttribute(
        "href",
        "data:text/csv;charset=utf-8," + encodeURIComponent(output_string)
      );
      filename = name + ".csv";
    }
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  ReportsTableExport: (data, name, format) => {
    let rows = [];
    for (let user_report of data) {
      let rowData = [];
      user_report.name ? rowData.push(user_report.name) : rowData.push(user_report.email);
      user_report.email ? rowData.push(user_report.email) : rowData.push(user_report.email);
      user_report.role ? rowData.push(user_report.role) : 'no role';
      user_report.completed ? rowData.push(user_report.completed) : '0';
      user_report.pending ? rowData.push(user_report.pending) : '0';
      user_report.overdue ? rowData.push(user_report.overdue) : '0';
      user_report.total_time ? rowData.push(user_report.total_time) : '00:00:00';      
      if (!user_report.length)
        rows.push([
          user_report.name ?  user_report.name.charAt(0).toUpperCase() +  user_report.name.slice(1) : user_report.email,
          user_report.email ? user_report.email : 'no email',
          user_report.role ? user_report.role.charAt(0).toUpperCase() +  user_report.role.slice(1) : 'no role',
          user_report.completed  ? user_report.completed  : '0',
          user_report.pending ? user_report.pending : '0',
          user_report.overdue ? user_report.overdue : '0',
          user_report.total_time ? user_report.total_time : '0'
         
        ]);
    }

    var output_string = "Members, Email, Role, Completed Task,Pending Tasks, Overdue Tasks , Time Spent\n";
    rows.forEach(function(row) {
      output_string += row.join(",");
      output_string += "\n";
    });

    // Download it
    var filename;
    var link = document.createElement("a");
    link.style.display = "none";
    link.setAttribute("target", "_blank");

    // For excel format
    if (format == "xlsx") {
      link.setAttribute(
        "href",
        "data:application/vnd.ms-excel;charset=utf-8," +
          encodeURIComponent(output_string)
      );
      filename = name + ".xlsx";
    }
    // For CSV format
    else if (format == "csv") {
      link.setAttribute(
        "href",
        "data:text/csv;charset=utf-8," + encodeURIComponent(output_string)
      );
      filename = name + ".csv";
    }
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },
};
