import './MdsReactUtils.css'
import React, { useState, useEffect, createRef } from 'react'
import { render } from 'react-dom'
import { Modal } from 'react-bootstrap'
import axios from 'axios'
import Swal from 'sweetalert2'
import UI from 'lockui'
import store from '../../store'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronRight, faChevronDown } from '@fortawesome/free-solid-svg-icons'
// Para comprobar los parametros
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
// Ajax Personalizado
window.activeAjax = 0;
export function RunAjax(obj) {

    function unlock() {
        setTimeout(() => {
            if (window.activeAjax < 1) UI.unlock()
        }, 500);
    }
    var data = typeof obj.data === "object" ? obj.data : {};
    data.RedirectGroup = window.RedirectGroup ? window.RedirectGroup : "";
    obj.data = data;

    const instance = axios.create({
        baseURL: obj.baseURL ? obj.baseURL : (window.SitePath ? window.SitePath : '') + '/api',
        method: obj.method ? obj.method : 'post',
        timeout: 300000,
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

            window.activeAjax++;
            const res = await instance(obj)

            if (res.data.hasOwnProperty('Code') && res.data.Code === 0 && res.data.hasOwnProperty('DataModel')) {

                resolve(res.data.DataModel);

            } else if (res.data.hasOwnProperty('Code') && res.data.Code !== 0 && res.data.hasOwnProperty('Message') && res.data.hasOwnProperty('Detail')) {

                Dlg.error(res.data.Message, null, res.data.Detail);

                reject({
                    Code: res.data.Code,
                    Message: res.data.Message,
                    Detail: res.data.Detail,
                    DataModel: null,
                    UserInfo: null,
                    Trace: null
                })

            } else {

                resolve(res.data)
            }

            if (res.data.hasOwnProperty('Trace') && res.data.Trace.hasOwnProperty('Transactions')) {

                store.dispatch({ type: 'SET_TRACE', payload: res.data.Trace.Transactions })

            }


        } catch (err) {

            Dlg.warning(err.message, null, err.stack)

            reject({
                Code: 1,
                Message: err.message,
                Detail: err.stack,
                DataModel: null,
                UserInfo: null,
                Trace: null
            })

        } finally {

            window.activeAjax--;
            unlock()
        }
    })
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
    title = EsTipo('string', title) ? title : 'AVISO';
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
// Para mostrar Dialog
export function Dlg(message, title, detail, btnText, type) {

    function valid(param) {
        return typeof param === 'string';
    }

    message = valid(message) ? message : '';
    title = valid(title) ? title : 'AVISO';
    btnText = valid(btnText) ? btnText : 'ACEPTAR';
    detail = valid(detail) ? detail : null;
    type = valid(type) ? type : '';

    function ifDetail(param) {
        if (param === null) return null;
        function handleLink(e) {
            e.preventDefault()
            pRef.current.style.display === 'none' ? pRef.current.style.display = '' : pRef.current.style.display = 'none';
        }
        const pRef = createRef()
        return (
            <>
                <div style={{ paddingTop: '10px' }}>
                    <a href="#!" onClick={(e) => handleLink(e)} style={{ color: 'inherit' }}> Ver Detalle </a>
                    <p ref={pRef} style={{ maxHeight: '40vh', overflow: 'auto', display: 'none', wordBreak: 'break-all' }}>
                        {detail}
                    </p>
                </div>
            </>
        );
    }
    function msgBody() {
        return (
            <>
                <p style={{
                    fontSize: '15px',
                    margin: 0,
                    fontWeight: 'normal',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    wordBreak: "break-all",
                }}>{message} </p>
                {ifDetail(detail)}

            </>
        )
    }
    function typeMsg() {
        switch (type) {
            case 'warning':
                return {
                    padding: '15px',
                    height: '45px',
                    backgroundColor: 'rgb(240, 173, 78)',
                    color: 'white'
                }
            case 'error':
                return {
                    padding: '15px',
                    height: '45px',
                    backgroundColor: 'rgb(237, 85, 101)',
                    color: 'white'
                }
            default:
                return {
                    padding: '15px',
                    height: '45px'
                };
        }
    }
    function ModalComponent() {

        const [show, setShow] = useState(false);

        const handleClose = () => {
            document.body.removeChild(container)
            setShow(false);
        }
        const handleShow = () => setShow(true);

        useEffect(() => {
            handleShow()
        }, [])

        return (
            <Modal show={show} onHide={handleClose} dialogClassName="mds-react-utils-dlg">
                <Modal.Header closeButton style={typeMsg()}>
                    <Modal.Title>:: {title} ::</Modal.Title>
                </Modal.Header>
                <Modal.Body>{msgBody()}</Modal.Body>
                <Modal.Footer>
                    <button className="btn btn-primary btn-sm" onClick={handleClose}>
                        {btnText}
                    </button>
                </Modal.Footer>
            </Modal>
        );
    }

    var container = document.createElement('div')
    document.body.appendChild(container)

    render(<ModalComponent />, container)

}
Dlg.error = function (message, title, detail, btnText) {
    Dlg(message, title, detail, btnText, 'error');
};
Dlg.warning = function (message, title, detail, btnText) {
    Dlg(message, title, detail, btnText, 'warning');
};
export function OpenTrace(trace) {

    if (!Array.isArray(trace)) return null

    function ModalComponent() {

        const [show, setShow] = useState(false);

        const handleClose = () => {
            document.body.removeChild(container)
            setShow(false);
        }
        const handleShow = () => setShow(true);

        useEffect(() => {
            handleShow()
        }, [])

        return (
            <Modal size="lg" show={show} onHide={handleClose} dialogClassName="mds-react-utils-dlg tx-trace">
                <Modal.Header closeButton>
                    <Modal.Title>:: TRACE ::</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <table style={{ width: '100%' }}>
                        <thead>
                            <tr>
                                <th>
                                    TRANSACCIÓN
                                </th>
                                <th>
                                    TIEMPO
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {trace.map((tx, i) => (
                                <tr key={i}>
                                    <td>{tx.Name}</td>
                                    <td>{tx.BackendTime}</td>
                                </tr>
                            ))}
                        </tbody>

                    </table>
                </Modal.Body>
                <Modal.Footer>
                    <button className="btn btn-primary btn-sm" onClick={handleClose}>
                        ACEPTAR
                    </button>
                </Modal.Footer>
            </Modal>
        );
    }

    var container = document.createElement('div')
    document.body.appendChild(container)

    render(<ModalComponent />, container)
}
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
// Para obtener las variables de la URL
export function GetUrlParams(location, variable) {
    'use strict';
    if (location.indexOf('?') !== -1) {
        var queryAll = location.split('?');
        var query = queryAll[1];
        var vars = query.split('&');
        if (!EsTipo('string', variable)) {
            var obj = new Object();
            for (var j = 0, leng = vars.length; j < leng; j++) {
                var pair = vars[j].split('=');
                obj[pair[0]] = pair[1];
            }
            return obj;
        } else {
            for (var i = 0, len = vars.length; i < len; i++) {
                var currentPair = vars[i].split('=');
                if (currentPair[0] === variable) {
                    return currentPair[1];
                }
            }
        }
    }
    return false;
}
export const i18n = {
    get: function (resource) {
        // chequear que exista el i18nDictionary
        if (!window.i18nDictionary)
            return resource;
        // obtener el value
        var value = window.i18nDictionary[resource];
        if (!value)
            // no existe la entrada
            return resource;
        // ver si en un get con format
        var args = Array.prototype.slice.call(arguments, 1);
        if (args.length == 0)
            return value;
        // no hay args
        // aplicar el format
        return value.replace(/{(\d+)}/g, function (match, number) {
            return typeof args[number] != 'undefined' ? args[number] : match;
        });
    }
};

// Para generar un identificador unico
export function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// Para crear una tabla tipo arbol
export function TreeTable(settings) {

    var allColumns = Array.isArray(settings.columns) ? settings.columns : [];
    var data = Array.isArray(settings.data) ? settings.data : [];

    var columns = [];

    for (var ac = 0, lenAc = allColumns.length; ac < lenAc; ac++) {
        var currentColumn = allColumns[ac];
        if (currentColumn['visible'] === false) continue;
        columns.push(currentColumn);
    }

    var columnsLength = columns.length;

    function actionLink(e) {

        var path = e.nativeEvent.composedPath();
        function getNode(name) {
            var node = null;
            for (var k in path) {
                if (path[k].nodeName === name) {
                    node = path[k]
                    break
                }
            }
            return node;
        }

        var tr = getNode('TR')
        var icon = tr.querySelector('[icon-tree-table]')
        var body = getNode('TBODY')

        var target = '[data-parent="' + tr.getAttribute('data-index') + '"]';
        var isExpanded = tr.getAttribute('data-control') === 'expanded';
        var children = body.querySelectorAll(target);

        if (!isExpanded) {

            for (var c = 0, len = children.length; c < len; c++) {
                var current = children[c];
                current.style.display = '';
                var a = current.querySelector('[icon-tree-table]');
                if (a) a.setAttribute('style', "transform: rotate(0deg)");
            }
            icon.style.transform = 'rotate(90deg)';
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
            icon.style.transform = 'rotate(0deg)'
            tr.setAttribute('data-control', 'collapsed');
        }
    }

    var index = -1;
    function Level(props) {

        const { dataLevel, lv, parentRow } = props;
        return (
            <React.Fragment>
                {
                    dataLevel.map(function (row) {
                        index++;
                        var treeChildren = [];

                        for (var ch in row) {
                            if (Array.isArray(row[ch]) && row[ch].length > 0) treeChildren.push(ch);
                        }

                        for (var c = 0; c < columnsLength; c++) {
                            row[columns[c].data] = row[columns[c].data] ? row[columns[c].data] : '';
                        }

                        return (
                            <React.Fragment key={uuidv4()}>
                                <tr data-index={index} data-level={lv} data-parent={lv > 1 ? parentRow : null} data-control={treeChildren.length > 0 ? 'collapsed' : null} style={{ display: lv > 1 ? 'none' : null }}>
                                    {
                                        columns.map(function (currentCol, i) {

                                            var data = row[currentCol.data] ? row[currentCol.data] : '';
                                            var text = typeof currentCol.render === 'function' ? currentCol.render(data, row, index) : data;
                                            var content = <div className='content' style={{ display: 'inline', marginLeft: i === 0 && treeChildren.length > 0 ? '5px' : null }}>{text}</div>;
                                            return i === 0 && treeChildren.length > 0
                                                ?
                                                <td key={uuidv4()} className={currentCol.className ? currentCol.className : ''} style={{ paddingLeft: lv > 1 ? (lv * 11 + 'px') : null }}>
                                                    <svg onClick={(e) => actionLink(e)} aria-hidden="true" focusable="false" data-prefix="fas" data-icon="chevron-right" className="svg-inline--fa fa-chevron-right fa-w-10 " role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512" icon-tree-table="icon-tree-table"><path fill="currentColor" d="M285.476 272.971L91.132 467.314c-9.373 9.373-24.569 9.373-33.941 0l-22.667-22.667c-9.357-9.357-9.375-24.522-.04-33.901L188.505 256 34.484 101.255c-9.335-9.379-9.317-24.544.04-33.901l22.667-22.667c9.373-9.373 24.569-9.373 33.941 0L285.475 239.03c9.373 9.372 9.373 24.568.001 33.941z"></path></svg>

                                                    {content}
                                                </td>
                                                :
                                                <td key={uuidv4()} className={currentCol.className ? currentCol.className : ''} style={{
                                                    paddingLeft: i === 0 ? ((lv > 1 ? (lv * 11) : 0) + (lv > 1 ? 14 : 21) + 'px') : i === 0 && lv === 1 ? '20px' : null
                                                    }}>
                                                    {content}
                                                </td>
                                        })
                                    }
                                </tr>
                                {
                                    treeChildren.map(function (ct) {
                                        return <Level
                                            dataLevel={row[ct]}
                                            lv={lv + 1}
                                            parentRow={index}
                                            key={uuidv4()}
                                        />
                                    })
                                }
                            </React.Fragment>
                        )
                    })
                }
            </React.Fragment>
        )
    }

    return (
        <table style={{ width: '100%' }} className='table fnu-treetable'>

            <thead>

                <tr>
                    {
                        columns.map(function (ccl, i) {
                            var title = ccl.title ? ccl.title : '';
                            var className = ccl.className ? ccl.className : '';
                            return <th key={uuidv4()} className={className} style={{paddingLeft: i === 0 ? '21px' : null}}>{title}</th>;
                        })
                    }
                </tr>

            </thead>

            <tbody>

                {
                    data.length === 0
                        ?
                        <tr>
                            <td colSpan={columnsLength} style={{ textAlign: 'center' }}>{typeof settings.empty === "string" ? settings.empty : i18n.get('NO SE ENCONTRARON REGISTROS')}</td>
                        </tr>
                        : null
                }

                <Level
                    dataLevel={data}
                    lv={1}
                />


            </tbody>

        </table>

    )
}
