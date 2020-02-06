import Swal from 'sweetalert2'
import UI from 'lockui'
import axios from 'axios'
import './msg.css'




export function EsTipo(type, param) {
    if (typeof type === 'string') {
        switch (type) {
            case 'array':
                return Array.isArray(param);
            case 'object':
                return Object.prototype.toString.call(param) === "[object Object]";
            case 'formdata':
                return Object.prototype.toString.call(param) === "[object FormData]";
            case 'file':
                return Object.prototype.toString.call(param) === "[object File]";
            default:
                return typeof param === type;
        }
    }
    return false;
}
// Para usar SweetAlert2 ver "9" https://cdn.jsdelivr.net/npm/sweetalert2@9.4.0/dist/sweetalert2.all.min.js
export function Msg(text, type, title, confirmButtonText, thenFn, cancelFn, isConfirm) {

    thenFn = EsTipo('function', thenFn) ? thenFn : function () { };
    cancelFn = EsTipo('function', cancelFn) ? cancelFn : function () { };
    for (var i = 0, len = arguments.length; i < len; i++) {
        var siguiente = i + 1;
        if (EsTipo('function', arguments[i])) {
            thenFn = arguments[i];
            if (EsTipo('function', arguments[siguiente])) cancelFn = arguments[siguiente];
            break;
        }
    }

    isConfirm = EsTipo('boolean', isConfirm) ? isConfirm : false;
    title = EsTipo('string', title) ? title : 'ATENCIÓN';
    type = EsTipo('string', type) ? type : 'warning';
    text = EsTipo('string', text) ? text : '';
    confirmButtonText = EsTipo('string', confirmButtonText) ? confirmButtonText : isConfirm ? 'SI, CONFIRMAR' : 'ACEPTAR';
    var isMovile = Msg.movil === true;

    Swal.fire({
        title: title,
        html: text,
        icon: type,
        confirmButtonText: confirmButtonText,
        allowOutsideClick: false,
        allowEscapeKey: false,
        focusConfirm: false,
        showCancelButton: isConfirm,
        cancelButtonColor: isMovile ? '#19a0a1' : 'rgb(26, 179, 148)',
        cancelButtonText: 'CANCELAR',
        confirmButtonColor: isConfirm ? isMovile ? '#ed5565' : 'rgb(237, 85, 101)' : isMovile ? '#19a0a1' : 'rgb(26, 179, 148)',
        reverseButtons: isConfirm
    })
        .then(function (res) {
            if (res.value) {
                thenFn(res);
            } else if (res.dismiss === Swal.DismissReason.cancel) {
                cancelFn(res);
            }
        })
}
Msg.confirm = function (text, type, title, confirmButtonText, thenFn, cancelFn) {
    Msg(text, type, title, confirmButtonText, thenFn, cancelFn, true);
};
// Convertir Byte Array (byte[]) a base64
// eslint-disable-next-line
export function ByteArrToBase64(buffer) {

    var binary = '';
    var bytes = new Uint8Array(buffer);
    var len = bytes.byteLength;
    for (var i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}
// Saber tamaño en bytes de un string
// eslint-disable-next-line
export function ByteSize(s) {
    return unescape(encodeURI(s)).length;
}
// Convertir codigos HEX a valores RGB (#000000 -> rgb(0,0,0))
// eslint-disable-next-line
export function HexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? parseInt(result[1], 16) + ',' + parseInt(result[2], 16) + ',' + parseInt(result[3], 16) : null;
}
// Para obtener número(s) random verdadero(s)
// eslint-disable-next-line
export function RandomExact(cantidad) {

    cantidad = parseInt(cantidad) > 0 ? parseInt(cantidad) : 1;
    var result = [];
    for (var i = 0; i < cantidad; i++) {
        result.push(window.crypto.getRandomValues(new Uint32Array(1))[0]);
    }
    return cantidad > 1 ? result : result[0];
}
// eslint-disable-next-line
export function KeysFormData(fd) {

    if (!EsTipo('formdata', fd)) return [];
    var arrKeys = [];
    fd.forEach(function (val, key) {
        arrKeys.push(key);
    });
    return arrKeys;
}
// Para crear una tabla tipo arbol
// eslint-disable-next-line
Object.defineProperty(Object.prototype, 'treeTable', {
    value: function (settings) {

        var table = this;
        if (!table || Object.prototype.toString.call(settings) !== "[object Object]") return null;

        var allColumns = Array.isArray(settings.columns) ? settings.columns : [];
        var data = Array.isArray(settings.data) ? settings.data : [];
        // eslint-disable-next-line
        var icons = Object.prototype.toString.call(icons) === "[object Object]" ? settings.icons : {};
        var iconCollapsed = icons.collapsed ? icons.collapsed : 'fa fa-chevron-right';
        var iconExpanded = icons.expanded ? icons.expanded : 'fa fa-chevron-down';
        var columns = [];

        for (var ac = 0, lenAc = allColumns.length; ac < lenAc; ac++) {
            var currentColumn = allColumns[ac];
            if (currentColumn['visible'] === false) continue;
            columns.push(currentColumn);
        }

        table.innerHTML = '';

        var thead = document.createElement('thead');
        var trHead = document.createElement('tr');
        var columnsLength = columns.length;

        for (var cl = 0; cl < columnsLength; cl++) {
            var ccl = columns[cl];
            var th = document.createElement('th');
            var title = ccl.title ? ccl.title : '';
            var className = ccl.className ? ccl.className : '';
            th.innerHTML = title;
            th.className = className;
            trHead.appendChild(th);
        }

        thead.appendChild(trHead);
        table.appendChild(thead);

        var tbody = document.createElement('tbody');

        if (data.length === 0) {
            var trEmpty = document.createElement('tr');
            var tdEmpty = document.createElement('td');
            tdEmpty.innerHTML = 'NO SE ENCONTRARON REGISTROS';
            tdEmpty.colSpan = columnsLength;
            tdEmpty.style.textAlign = 'center';
            trEmpty.appendChild(tdEmpty);
            tbody.appendChild(trEmpty);
        }
        function actionLink() {
            var icon = this;
            var tr = this.parentNode.parentNode;
            var target = '[data-parent="' + tr.getAttribute('data-index') + '"]';
            var isExpanded = tr.getAttribute('data-control') === 'expanded';
            var body = tr.parentNode;
            var children = body.querySelectorAll(target);

            if (!isExpanded) {

                for (var c = 0, len = children.length; c < len; c++) {
                    var current = children[c];
                    current.style.display = '';
                    var a = current.querySelector('a[icon-tree-table]');
                    if (a) a.className = iconCollapsed;
                }
                icon.className = iconExpanded;
                tr.setAttribute('data-control', 'expanded');
            } else {

                var closeChildren = function (children) {
                    for (var i = 0, len = children.length; i < len; i++) {
                        var current = children[i];
                        current.style.display = 'none';
                        var id = current.getAttribute('data-index');
                        var child = body.querySelectorAll('[data-parent="' + id + '"]');
                        var currentExpanded = current.getAttribute('data-control') === 'expanded';
                        if (child.length > 0 && currentExpanded) {
                            current.setAttribute('data-control', 'collapsed');
                            closeChildren(child);
                        }
                    }
                };
                closeChildren(children);
                icon.className = iconCollapsed;
                tr.setAttribute('data-control', 'collapsed');
            }
        }

        var index = -1;
        function level(dataLevel, lv, parentRow) {

            for (var id = 0, len = dataLevel.length; id < len; id++) {

                index++;
                var row = dataLevel[id];
                var treeChildren = [];
                var tr = document.createElement('tr');

                for (var ch in row) {
                    if (Array.isArray(row[ch]) && row[ch].length > 0) treeChildren.push(ch);
                }

                for (var c = 0; c < columnsLength; c++) {
                    row[columns[c].data] = row[columns[c].data] ? row[columns[c].data] : '';
                }

                for (var i = 0; i < columnsLength; i++) {

                    var data = row[columns[i].data];
                    var text = typeof columns[i].render === 'function' ? columns[i].render(data, tr, row, index) : data;
                    var content = document.createElement('div');
                    content.style.display = 'inline';
                    content.innerHTML = text;
                    if (i === 0 && treeChildren.length > 0) {
                        var tdPrimary = document.createElement('td');
                        var icon = document.createElement('a');
                        icon.className = iconCollapsed;
                        icon.setAttribute('icon-tree-table', true);
                        icon.addEventListener('click', actionLink, false);
                        tdPrimary.appendChild(icon);
                        tdPrimary.appendChild(content);
                        tdPrimary.className = columns[i].className ? columns[i].className : '';
                        tdPrimary.setAttribute('style', 'padding-left: ' + lv * 11 + 'px !important');
                        tr.appendChild(tdPrimary);
                        tr.setAttribute('data-control', 'collapsed');
                    } else {
                        var td = document.createElement('td');
                        td.appendChild(content);
                        td.className = columns[i].className ? columns[i].className : '';
                        tr.appendChild(td);
                    }
                    if (lv > 1) {
                        tr.style.display = 'none';
                        tr.setAttribute('data-parent', parentRow);
                    }
                    tr.setAttribute('data-index', index);
                    tr.setAttribute('data-level', lv);
                }
                tbody.appendChild(tr);

                for (var t = 0, lent = treeChildren.length; t < lent; t++) {

                    var ct = treeChildren[t];

                    level(row[ct], lv + 1, index);
                }
            }
        }

        level(data, 1);

        table.appendChild(tbody);
    }
});


window.activeAjax = 0;

export function RunAjax(obj) {

    function unlock() {
        setTimeout(() => {
            if (activeAjax < 1) UI.unlock()
        }, 500);
    }

    const instance = axios.create({
        baseURL: obj.baseURL ? obj.baseURL + '/api' : '/api',
        method: obj.method ? method : 'post',
        timeout: 180000,
    });

    instance.interceptors.request.use(function (config) {
        UI.lock()
        return config;
    }, function (error) {
        unlock()
        return Promise.reject(error);
    });

    instance.interceptors.response.use(function (response) {
        return response;
    }, function (error) {
        unlock()
        return Promise.reject(error);
    });

    return new Promise(async (resolve, reject) => {

        try {
            activeAjax++;
            const res = await instance(obj)
            if (res.data.hasOwnProperty('Code') && res.data.Code === 0 && res.data.hasOwnProperty('DataModel')) {

                resolve(res.data.DataModel);

            } else if (res.data.hasOwnProperty('Code') && res.data.Code !== 0 && res.data.hasOwnProperty('Message') && res.data.hasOwnProperty('Detail')) {

                reject({
                    Code: 1,
                    Message: res.data.Message,
                    Detail: res.data.Detail,
                    DataModel: null,
                    UserInfo: null,
                    Trace: null
                })
            } else {

                resolve(res.data)
            }

        } catch (err) {

            reject({
                Code: 1,
                Message: err.message,
                Detail: err.stack,
                DataModel: null,
                UserInfo: null,
                Trace: null
            })
        } finally {
            activeAjax--;
            unlock()
        }
    })
}