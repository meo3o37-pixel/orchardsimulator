import __vite__cjsImport0_react from "/node_modules/.vite/deps/react.js?v=c21c2a61"; const React = __vite__cjsImport0_react.__esModule ? __vite__cjsImport0_react.default : __vite__cjsImport0_react;
import __vite__cjsImport1_reactDom_client from "/node_modules/.vite/deps/react-dom_client.js?v=c21c2a61"; const ReactDOM = __vite__cjsImport1_reactDom_client.__esModule ? __vite__cjsImport1_reactDom_client.default : __vite__cjsImport1_reactDom_client;
import App from "/src/App.jsx?t=1776180216669";
import "/src/styles.css?t=1776179782689";
class RootErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  componentDidCatch(error, info) {
    console.error("[RootErrorBoundary]", error, info);
  }
  render() {
    if (this.state.error) {
      return /* @__PURE__ */ React.createElement("div", { style: { padding: 24, color: "#7a1f1f", fontFamily: "sans-serif", lineHeight: 1.5 } }, /* @__PURE__ */ React.createElement("h2", { style: { marginTop: 0 } }, "화면 렌더링 오류"), /* @__PURE__ */ React.createElement("p", null, "앱 실행 중 오류가 발생했습니다. 아래 메시지를 캡처해서 보내주세요."), /* @__PURE__ */ React.createElement(
        "pre",
        {
          style: {
            whiteSpace: "pre-wrap",
            background: "#fff6f6",
            border: "1px solid #efc9c9",
            padding: 12,
            borderRadius: 8
          }
        },
        String(this.state.error?.stack || this.state.error?.message || this.state.error)
      ));
    }
    return this.props.children;
  }
}
ReactDOM.createRoot(document.getElementById("root")).render(
  /* @__PURE__ */ React.createElement(RootErrorBoundary, null, /* @__PURE__ */ React.createElement(React.StrictMode, null, /* @__PURE__ */ React.createElement(App, null)))
);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1haW4uanN4Il0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgUmVhY3RET00gZnJvbSAncmVhY3QtZG9tL2NsaWVudCc7XG5pbXBvcnQgQXBwIGZyb20gJy4vQXBwLmpzeCc7XG5pbXBvcnQgJy4vc3R5bGVzLmNzcyc7XG5cbmNsYXNzIFJvb3RFcnJvckJvdW5kYXJ5IGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgY29uc3RydWN0b3IocHJvcHMpIHtcbiAgICBzdXBlcihwcm9wcyk7XG4gICAgdGhpcy5zdGF0ZSA9IHsgZXJyb3I6IG51bGwgfTtcbiAgfVxuXG4gIHN0YXRpYyBnZXREZXJpdmVkU3RhdGVGcm9tRXJyb3IoZXJyb3IpIHtcbiAgICByZXR1cm4geyBlcnJvciB9O1xuICB9XG5cbiAgY29tcG9uZW50RGlkQ2F0Y2goZXJyb3IsIGluZm8pIHtcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tY29uc29sZVxuICAgIGNvbnNvbGUuZXJyb3IoJ1tSb290RXJyb3JCb3VuZGFyeV0nLCBlcnJvciwgaW5mbyk7XG4gIH1cblxuICByZW5kZXIoKSB7XG4gICAgaWYgKHRoaXMuc3RhdGUuZXJyb3IpIHtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIDxkaXYgc3R5bGU9e3sgcGFkZGluZzogMjQsIGNvbG9yOiAnIzdhMWYxZicsIGZvbnRGYW1pbHk6ICdzYW5zLXNlcmlmJywgbGluZUhlaWdodDogMS41IH19PlxuICAgICAgICAgIDxoMiBzdHlsZT17eyBtYXJnaW5Ub3A6IDAgfX0+7ZmU66m0IOugjOuNlOungSDsmKTrpZg8L2gyPlxuICAgICAgICAgIDxwPuyVsSDsi6Ttlokg7KSRIOyYpOulmOqwgCDrsJzsg53tlojsirXri4jri6QuIOyVhOuemCDrqZTsi5zsp4Drpbwg7Lqh7LKY7ZW07IScIOuztOuCtOyjvOyEuOyalC48L3A+XG4gICAgICAgICAgPHByZVxuICAgICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgICAgd2hpdGVTcGFjZTogJ3ByZS13cmFwJyxcbiAgICAgICAgICAgICAgYmFja2dyb3VuZDogJyNmZmY2ZjYnLFxuICAgICAgICAgICAgICBib3JkZXI6ICcxcHggc29saWQgI2VmYzljOScsXG4gICAgICAgICAgICAgIHBhZGRpbmc6IDEyLFxuICAgICAgICAgICAgICBib3JkZXJSYWRpdXM6IDhcbiAgICAgICAgICAgIH19XG4gICAgICAgICAgPlxuICAgICAgICAgICAge1N0cmluZyh0aGlzLnN0YXRlLmVycm9yPy5zdGFjayB8fCB0aGlzLnN0YXRlLmVycm9yPy5tZXNzYWdlIHx8IHRoaXMuc3RhdGUuZXJyb3IpfVxuICAgICAgICAgIDwvcHJlPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLnByb3BzLmNoaWxkcmVuO1xuICB9XG59XG5cblJlYWN0RE9NLmNyZWF0ZVJvb3QoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Jvb3QnKSkucmVuZGVyKFxuICA8Um9vdEVycm9yQm91bmRhcnk+XG4gICAgPFJlYWN0LlN0cmljdE1vZGU+XG4gICAgICA8QXBwIC8+XG4gICAgPC9SZWFjdC5TdHJpY3RNb2RlPlxuICA8L1Jvb3RFcnJvckJvdW5kYXJ5PlxuKTtcbiJdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxXQUFXO0FBQ2xCLE9BQU8sY0FBYztBQUNyQixPQUFPLFNBQVM7QUFDaEIsT0FBTztBQUVQLE1BQU0sMEJBQTBCLE1BQU0sVUFBVTtBQUFBLEVBQzlDLFlBQVksT0FBTztBQUNqQixVQUFNLEtBQUs7QUFDWCxTQUFLLFFBQVEsRUFBRSxPQUFPLEtBQUs7QUFBQSxFQUM3QjtBQUFBLEVBRUEsT0FBTyx5QkFBeUIsT0FBTztBQUNyQyxXQUFPLEVBQUUsTUFBTTtBQUFBLEVBQ2pCO0FBQUEsRUFFQSxrQkFBa0IsT0FBTyxNQUFNO0FBRTdCLFlBQVEsTUFBTSx1QkFBdUIsT0FBTyxJQUFJO0FBQUEsRUFDbEQ7QUFBQSxFQUVBLFNBQVM7QUFDUCxRQUFJLEtBQUssTUFBTSxPQUFPO0FBQ3BCLGFBQ0Usb0NBQUMsU0FBSSxPQUFPLEVBQUUsU0FBUyxJQUFJLE9BQU8sV0FBVyxZQUFZLGNBQWMsWUFBWSxJQUFJLEtBQ3JGLG9DQUFDLFFBQUcsT0FBTyxFQUFFLFdBQVcsRUFBRSxLQUFHLFdBQVMsR0FDdEMsb0NBQUMsV0FBRSx3Q0FBc0MsR0FDekM7QUFBQSxRQUFDO0FBQUE7QUFBQSxVQUNDLE9BQU87QUFBQSxZQUNMLFlBQVk7QUFBQSxZQUNaLFlBQVk7QUFBQSxZQUNaLFFBQVE7QUFBQSxZQUNSLFNBQVM7QUFBQSxZQUNULGNBQWM7QUFBQSxVQUNoQjtBQUFBO0FBQUEsUUFFQyxPQUFPLEtBQUssTUFBTSxPQUFPLFNBQVMsS0FBSyxNQUFNLE9BQU8sV0FBVyxLQUFLLE1BQU0sS0FBSztBQUFBLE1BQ2xGLENBQ0Y7QUFBQSxJQUVKO0FBQ0EsV0FBTyxLQUFLLE1BQU07QUFBQSxFQUNwQjtBQUNGO0FBRUEsU0FBUyxXQUFXLFNBQVMsZUFBZSxNQUFNLENBQUMsRUFBRTtBQUFBLEVBQ25ELG9DQUFDLHlCQUNDLG9DQUFDLE1BQU0sWUFBTixNQUNDLG9DQUFDLFNBQUksQ0FDUCxDQUNGO0FBQ0Y7IiwibmFtZXMiOltdfQ==