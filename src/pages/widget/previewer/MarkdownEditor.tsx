import "./MarkdownEditor.less"
import React from "react";
import * as ReactDOM from 'react-dom';
import Vditor from 'vditor'
import "vditor/dist/index.css"
import FileUtil from "../../../common/util/FileUtil";
import {CloseOutlined} from "@ant-design/icons";
import { message } from "antd";
import MessageBoxUtil from "../../../common/util/MessageBoxUtil";
import { clearInterval } from "timers";
import JsonUtil from "../../../common/util/JsonUtil";


interface IProps {
  name: string
  url: string
  size: number
  onClose: () => void
}

interface IState {

}

/**
 * Markdown预览器
 * Markdown支持的预览格式统统交由它处理
 */
export default class MarkdownEditor extends React.Component<IProps, IState> {

  constructor(props: IProps) {
    super(props);
    this.state = {};
  }

  componentDidMount() {

    let currentTime = new Date().getTime();
    let url = this.props.url;
    let currentTimeout = setTimeout(()=>{},20);
    

    const vditor = new Vditor('vditor', {
      height: 360,
      toolbarConfig: {
        pin: true,
      },
      cache: {
        enable: false,
      },
      after () {
        fetch(url).then(res=>{
          return res.text();
          }).then((res) => {
            vditor.setValue(res);
          });
      },

      input(value: string) {
        // 停用上一次
        currentTimeout && clearTimeout(currentTimeout);

        // 准备保存
        currentTimeout = setTimeout(() => {
          MarkdownEditor.saveContent(vditor, currentTime, url, currentTimeout)
        }, 5000)
      }, 

      toolbar: [
        {
          hotkey: '⌘S',
          name: 'save',
          tipPosition: 's',
          tip: '保存',
          className: 'left',
          icon: '<svg width="256px" height="256px" viewBox="0 0 256 256" id="Flat" xmlns="http://www.w3.org/2000/svg"><path d="M216.48535,82.82873l-43.31348-43.3125a11.91619,11.91619,0,0,0-8.48535-3.5166H48a12.01312,12.01312,0,0,0-12,12v160a12.01312,12.01312,0,0,0,12,12H79.91284c.02979.00074.05737.00879.08716.00879s.05737-.008.08716-.00879h95.82568c.02979.00074.05737.00879.08716.00879s.05737-.008.08716-.00879H208a12.01312,12.01312,0,0,0,12-12V91.31409A11.91838,11.91838,0,0,0,216.48535,82.82873ZM172,211.99963H84V152.00842a4.004,4.004,0,0,1,4-4h80a4.004,4.004,0,0,1,4,4Zm40-4a4.004,4.004,0,0,1-4,4H180V152.00842a12.01312,12.01312,0,0,0-12-12H88a12.01312,12.01312,0,0,0-12,12v59.99121H48a4.004,4.004,0,0,1-4-4v-160a4.004,4.004,0,0,1,4-4H164.68652a4.02633,4.02633,0,0,1,2.82813,1.17188L210.8291,88.485A3.97639,3.97639,0,0,1,212,91.31409ZM156,72.0094a4.0002,4.0002,0,0,1-4,4H96a4,4,0,0,1,0-8h56A4.0002,4.0002,0,0,1,156,72.0094Z"/></svg>',
          click () {
            currentTimeout && clearTimeout(currentTimeout);
            MarkdownEditor.saveContent(vditor, currentTime, url, currentTimeout)
          },
        },
        "emoji",
        "headings",
        "bold",
        "italic",
        "strike",
        "link",
        "|",
        "list",
        "ordered-list",
        "check",
        "outdent",
        "indent",
        "|",
        "quote",
        "line",
        "code",
        "inline-code",
        "insert-before",
        "insert-after",
        "|",
        "upload",
        "record",
        "table",
        "|",
        "undo",
        "redo",
        "|",
        "fullscreen",
        "edit-mode",
        {
            name: "more",
            toolbar: [
                "both",
                "code-theme",
                "content-theme",
                "export",
                "outline",
                "preview",
                "devtools",
                "info",
                "help",
            ],
        },
    ],
      
    });
    
  }
  
  static saveContent(vditor:Vditor, currentTime:number, url:string, currentTimeout:NodeJS.Timeout) {
    let formData = new FormData();
    let content = vditor.getValue();
    if (content) {
      currentTimeout && clearTimeout(currentTimeout);
    }

    formData.append("t", currentTime.toString());
    formData.append("content", content);

    var option = {
      method: "put",
      body : formData
    }
    
    // 自动保存
    fetch(url, option).then((res) => {
      return res.text()
    }).then((res) => {
      var rJson = JsonUtil.toObj(res);

      if(rJson.code == 'OK') {
        MessageBoxUtil.success(rJson.msg)
      } else {
        MessageBoxUtil.error(rJson.msg)
      }

    })
  }

  //展示
  static show(name: string, url: string, size: number) {

    let that = this;

    const div: Element = document.createElement('div');
    document.body.appendChild(div);

    let element: React.ReactElement = React.createElement(
      MarkdownEditor,
      {
        name: name,
        url: url,
        size: size,
        onClose: () => {
          //删除所有节点。
          const unmountResult = ReactDOM.unmountComponentAtNode(div);
          if (unmountResult && div.parentNode) {

            div.parentNode.removeChild(div);

          }
        }
      }
    )

    //将react组件挂载到div中去。
    ReactDOM.render(element, div);

  }

  render() {
    return <div className="browser-previewer">
      
      <div className="title-bar">

        <div className="left-part">

        </div>

        <div className="middle-part">
          {this.props.name}({FileUtil.humanFileSize(this.props.size)})
        </div>

        <div className="right-part">
        <span className="close btn-action">
          <CloseOutlined onClick={() => {
            this.props.onClose()
          }}/>
        </span>
        </div>


      </div>
      <div className="frame-area">
        <div id="vditor"/>
      </div>
    </div>
  }

}

