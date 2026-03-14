/* ==========================================================================
   Tệp: ketnoi.js - Trạm kết nối Github Pages <-> Google Apps Script
   Thiết kế và phát triển: Hoàng Ngọc Lâm
   ========================================================================== */

const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbys_v4n0ZrCV0ZnW98QHmHGtynI8V4cbeEHCz51y3XnYr3QBOfPoXBM7YPI8nhNrxEyIw/exec"; 

// Biến toàn cục lấy email từ sessionStorage (do màn hình đăng nhập ghi vào)
let USER_EMAIL = sessionStorage.getItem("SKT_USER_EMAIL") || "";

const google = {
    script: {
        run: createRunObject()
    }
};

// Thay thế đoạn function createRunObject trong SKT_KetNoi.js
function createRunObject(successCb = null, failureCb = null) {
    return new Proxy({}, {
        get: function(target, prop) {
            if (prop === 'withSuccessHandler') return function(cb) { return createRunObject(cb, failureCb); };
            if (prop === 'withFailureHandler') return function(cb) { return createRunObject(successCb, cb); };
            
            return function(...args) {
                // SỬA Ở ĐÂY: Dùng window.SKT_GLOBAL_EMAIL hoặc sessionStorage
                USER_EMAIL = window.SKT_GLOBAL_EMAIL || sessionStorage.getItem("SKT_USER_EMAIL") || "";
                executeBackend(prop, args, successCb, failureCb);
            };
        }
    });
}

function executeBackend(action, argsArray, onSuccess, onFailure) {
    let params = {};
    if (action === "SKT_getRecordByMaHS") params = { maHS: argsArray[0] };
    else if (action === "SKT_saveRecord") params = { dataArray: argsArray[0] };
    else if (action === "SKT_submitFinalRecord") params = { dataArray: argsArray[0] };
    else if (action === "SKT_deleteSingleRowNhatKy") params = { maHS: argsArray[0] };
    else if (action === "SKT_uploadMultipleFilesToDrive") params = { filesData: argsArray[0], maHoSo: argsArray[1], folderId: argsArray[2], oldUrl: argsArray[3], writeMode: argsArray[4] };
    else if (action === "SKT_uploadFolderEvidence") params = { parentId: argsArray[0], folderName: argsArray[1], filesData: argsArray[2], oldUrl: argsArray[3], writeMode: argsArray[4] };
    else if (action === "SKT_searchRecords") params = { criteria: argsArray[0] };
    else if (action === "SKT_createReportDoc") params = { criteria: argsArray[0] };

    fetch(WEB_APP_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({ action: action, params: params, email: USER_EMAIL })
    })
    .then(res => res.json())
    .then(res => {
        if (res.status === "success") { if (onSuccess) onSuccess(res.data); } 
        else { if (onFailure) onFailure(new Error(res.message)); else alert("Lỗi Server: " + res.message); }
    })
    .catch(err => {
        if (onFailure) onFailure(err); else console.error("Lỗi Fetch:", err);
    });

}


