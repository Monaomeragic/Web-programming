
const Utils = {
    parseJwt(token) {
      if (!token) return null;
      try {
        const payload = token.split('.')[1];
        return JSON.parse(atob(payload));
      } catch {
        return null;
      }
    },
    datatable(tableId, columns, data, pageLength = 15) {
      if ($.fn.dataTable.isDataTable("#" + tableId)) {
        $("#" + tableId).DataTable().destroy();
      }
      $("#" + tableId).DataTable({
        data, columns, pageLength,
        lengthMenu: [2,5,10,15,25,50,100,"All"]
      });
    }
  };