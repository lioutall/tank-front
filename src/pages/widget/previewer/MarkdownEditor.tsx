import "./MarkdownEditor.less"
import React from "react";
import * as ReactDOM from 'react-dom';
import Vditor from 'vditor'
//import "~/src/assets/scss/index.scss"
import FileUtil from "../../../common/util/FileUtil";
import {CloseOutlined} from "@ant-design/icons";
import { message } from "antd";
import MessageBoxUtil from "../../../common/util/MessageBoxUtil";
import { clearInterval } from "timers";

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
          let formData = new FormData();
          let content = vditor.getValue();
          if (content) {
            currentTimeout && clearTimeout(currentTimeout);
          }

          formData.append("t", currentTime.toString());
          formData.append("content", content);

          var option = {
            method: "post",
            body : formData
          }
          
          // 自动保存
          fetch(url, option).then((res) => {
            console.log(res.status);
            console.log(res.text());
            MessageBoxUtil.info("aa")
          })
        }, 5000)
      }
      
    });
    
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
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/vditor/dist/index.css" />
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

