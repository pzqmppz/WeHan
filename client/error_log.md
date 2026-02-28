## 001
当前的工作流遇到一点问题，我们的工作流里头基本上会有两个 HTTP 节点。当我点击这个节点时就会报错。我从控制台抓取的信息如下：
89771.1092db15.js:1 ErrorBoundary: not found logger instance in either props or context. errorBoundaryName: error-tips
W @ 89771.1092db15.js:1
ak @ lib-react.9d0c9c6b.js:2
up @ lib-react.9d0c9c6b.js:2
i @ lib-react.9d0c9c6b.js:2
oI @ lib-react.9d0c9c6b.js:2
（匿名） @ lib-react.9d0c9c6b.js:2
oO @ lib-react.9d0c9c6b.js:2
oP @ lib-react.9d0c9c6b.js:2
r5 @ lib-react.9d0c9c6b.js:2
（匿名） @ lib-react.9d0c9c6b.js:2
89771.1092db15.js:1 IS_RELEASE_VERSION true true
89771.1092db15.js:1 ErrorBoundary: not found logger instance in either props or context. errorBoundaryName: error-tips
W @ 89771.1092db15.js:1
ak @ lib-react.9d0c9c6b.js:2
up @ lib-react.9d0c9c6b.js:2
i @ lib-react.9d0c9c6b.js:2
oI @ lib-react.9d0c9c6b.js:2
（匿名） @ lib-react.9d0c9c6b.js:2
oO @ lib-react.9d0c9c6b.js:2
oP @ lib-react.9d0c9c6b.js:2
r5 @ lib-react.9d0c9c6b.js:2
（匿名） @ lib-react.9d0c9c6b.js:2
XMLHttpRequest.send
e.send @ sdk-glue.js:2
e @ bdms.js:2
e @ bdms.js:2
（匿名） @ bot_slardar_umd_cn.js:2
s @ bot_slardar_umd_cn.js:2
（匿名） @ lib-axios.e0aec18e.js:1
xhr @ lib-axios.e0aec18e.js:1
e5 @ lib-axios.e0aec18e.js:1
Promise.then
_request @ lib-axios.e0aec18e.js:1
request @ lib-axios.e0aec18e.js:1
（匿名） @ lib-axios.e0aec18e.js:1
request @ 89771.1092db15.js:1
PublicGetSubscriptionDetail @ 89771.1092db15.js:1
（匿名） @ 92701.31c8c84d.js:1
e @ lib-polyfill.b2cb2872.js:1
c @ lib-polyfill.b2cb2872.js:1
（匿名） @ lib-polyfill.b2cb2872.js:1
（匿名） @ lib-polyfill.b2cb2872.js:1
（匿名） @ async-main.8b0cdf10.js:1
e @ lib-polyfill.b2cb2872.js:1
c @ lib-polyfill.b2cb2872.js:1
（匿名） @ lib-polyfill.b2cb2872.js:1
（匿名） @ lib-polyfill.b2cb2872.js:1
（匿名） @ 73630.71be384e.js:1
（匿名） @ lib-polyfill.b2cb2872.js:1
（匿名） @ lib-polyfill.b2cb2872.js:1
（匿名） @ lib-polyfill.b2cb2872.js:1
h @ lib-polyfill.b2cb2872.js:1
n.runAsync @ 73630.71be384e.js:1
n.run @ 73630.71be384e.js:1
n.refresh @ 73630.71be384e.js:1
l @ 73630.71be384e.js:1
c @ 73630.71be384e.js:1
T @ 73630.71be384e.js:1
89771.1092db15.js:1 ErrorBoundary: not found logger instance in either props or context. errorBoundaryName: error-tips
W @ 89771.1092db15.js:1
ak @ lib-react.9d0c9c6b.js:2
up @ lib-react.9d0c9c6b.js:2
i @ lib-react.9d0c9c6b.js:2
oI @ lib-react.9d0c9c6b.js:2
（匿名） @ lib-react.9d0c9c6b.js:2
oO @ lib-react.9d0c9c6b.js:2
ox @ lib-react.9d0c9c6b.js:2
x @ lib-react.9d0c9c6b.js:2
T @ lib-react.9d0c9c6b.js:2
I.<computed> @ main.82bb0835.js:1
T @ main.82bb0835.js:1
P @ main.82bb0835.js:1
89771.1092db15.js:1 ErrorBoundary: not found logger instance in either props or context. errorBoundaryName: error-tips
W @ 89771.1092db15.js:1
ak @ lib-react.9d0c9c6b.js:2
i @ lib-react.9d0c9c6b.js:2
oI @ lib-react.9d0c9c6b.js:2
（匿名） @ lib-react.9d0c9c6b.js:2
oO @ lib-react.9d0c9c6b.js:2
oP @ lib-react.9d0c9c6b.js:2
r5 @ lib-react.9d0c9c6b.js:2
（匿名） @ lib-react.9d0c9c6b.js:2
oU @ lib-react.9d0c9c6b.js:2
ox @ lib-react.9d0c9c6b.js:2
x @ lib-react.9d0c9c6b.js:2
T @ lib-react.9d0c9c6b.js:2
I.<computed> @ main.82bb0835.js:1
T @ main.82bb0835.js:1
P @ main.82bb0835.js:1
lib-react.9d0c9c6b.js:2 TypeError: (t.doc || "").split is not a function
    at tb.create (25522.b473c358.js:4:238207)
    at render (25522.b473c358.js:2:8163)
    at 25522.b473c358.js:4:69849
    at uU (lib-react.9d0c9c6b.js:2:84328)
    at oV (lib-react.9d0c9c6b.js:2:113419)
    at oP (lib-react.9d0c9c6b.js:2:96237)
    at r5 (lib-react.9d0c9c6b.js:2:44965)
    at lib-react.9d0c9c6b.js:2:111866
    at oU (lib-react.9d0c9c6b.js:2:111871)
    at ox (lib-react.9d0c9c6b.js:2:95240)
a9 @ lib-react.9d0c9c6b.js:2
a.componentDidCatch.t.callback @ lib-react.9d0c9c6b.js:2
lW @ lib-react.9d0c9c6b.js:2
uX @ lib-react.9d0c9c6b.js:2
e @ lib-react.9d0c9c6b.js:2
e @ lib-react.9d0c9c6b.js:2
e @ lib-react.9d0c9c6b.js:2
（匿名） @ lib-react.9d0c9c6b.js:2
oU @ lib-react.9d0c9c6b.js:2
oP @ lib-react.9d0c9c6b.js:2
r5 @ lib-react.9d0c9c6b.js:2
（匿名） @ lib-react.9d0c9c6b.js:2
oU @ lib-react.9d0c9c6b.js:2
ox @ lib-react.9d0c9c6b.js:2
x @ lib-react.9d0c9c6b.js:2
T @ lib-react.9d0c9c6b.js:2
I.<computed> @ main.82bb0835.js:1
T @ main.82bb0835.js:1
P @ main.82bb0835.js:1
89771.1092db15.js:1  Logger  workflow-error  Event: react_error_collection {error: TypeError: (t.doc || "").split is not a function
    at tb.create (https://lf-coze-web-cdn.coze.cn/…} {reportJsError: true, errorBoundaryName: 'workflow-error-boundary', reactInfo: {…}}
95022.7ad9fddd.js:1 ❌ React错误边界捕获:  TypeError: (t.doc || "").split is not a function
    at tb.create (25522.b473c358.js:4:238207)
    at render (25522.b473c358.js:2:8163)
    at 25522.b473c358.js:4:69849
    at uU (lib-react.9d0c9c6b.js:2:84328)
    at oV (lib-react.9d0c9c6b.js:2:113419)
    at oP (lib-react.9d0c9c6b.js:2:96237)
    at r5 (lib-react.9d0c9c6b.js:2:44965)
    at lib-react.9d0c9c6b.js:2:111866
    at oU (lib-react.9d0c9c6b.js:2:111871)
    at ox (lib-react.9d0c9c6b.js:2:95240)
onError @ 95022.7ad9fddd.js:1
（匿名） @ 89771.1092db15.js:1
componentDidCatch @ 3368.4694e5f2.js:2
a.componentDidCatch.t.callback @ lib-react.9d0c9c6b.js:2
lW @ lib-react.9d0c9c6b.js:2
uX @ lib-react.9d0c9c6b.js:2
e @ lib-react.9d0c9c6b.js:2
e @ lib-react.9d0c9c6b.js:2
e @ lib-react.9d0c9c6b.js:2
（匿名） @ lib-react.9d0c9c6b.js:2
oU @ lib-react.9d0c9c6b.js:2
oP @ lib-react.9d0c9c6b.js:2
r5 @ lib-react.9d0c9c6b.js:2
（匿名） @ lib-react.9d0c9c6b.js:2
oU @ lib-react.9d0c9c6b.js:2
ox @ lib-react.9d0c9c6b.js:2
x @ lib-react.9d0c9c6b.js:2
T @ lib-react.9d0c9c6b.js:2
I.<computed> @ main.82bb0835.js:1
T @ main.82bb0835.js:1
P @ main.82bb0835.js:1
89771.1092db15.js:1 IS_RELEASE_VERSION true true
89771.1092db15.js:1 ErrorBoundary: not found logger instance in either props or context. errorBoundaryName: error-tips
W @ 89771.1092db15.js:1
ak @ lib-react.9d0c9c6b.js:2
up @ lib-react.9d0c9c6b.js:2
i @ lib-react.9d0c9c6b.js:2
oI @ lib-react.9d0c9c6b.js:2
（匿名） @ lib-react.9d0c9c6b.js:2
oO @ lib-react.9d0c9c6b.js:2
oP @ lib-react.9d0c9c6b.js:2
r5 @ lib-react.9d0c9c6b.js:2
（匿名） @ lib-react.9d0c9c6b.js:2
XMLHttpRequest.send
e.send @ sdk-glue.js:2
e @ bdms.js:2
e @ bdms.js:2
（匿名） @ bot_slardar_umd_cn.js:2
s @ bot_slardar_umd_cn.js:2
（匿名） @ lib-axios.e0aec18e.js:1
xhr @ lib-axios.e0aec18e.js:1
e5 @ lib-axios.e0aec18e.js:1
Promise.then
_request @ lib-axios.e0aec18e.js:1
request @ lib-axios.e0aec18e.js:1
（匿名） @ lib-axios.e0aec18e.js:1
request @ 89771.1092db15.js:1
PublicGetSubscriptionDetailV2 @ 89771.1092db15.js:1
（匿名） @ 57105.695b38ac.js:1
e @ lib-polyfill.b2cb2872.js:1
c @ lib-polyfill.b2cb2872.js:1
（匿名） @ lib-polyfill.b2cb2872.js:1
（匿名） @ lib-polyfill.b2cb2872.js:1
（匿名） @ 73630.71be384e.js:1
（匿名） @ lib-polyfill.b2cb2872.js:1
（匿名） @ lib-polyfill.b2cb2872.js:1
（匿名） @ lib-polyfill.b2cb2872.js:1
h @ lib-polyfill.b2cb2872.js:1
n.runAsync @ 73630.71be384e.js:1
n.run @ 73630.71be384e.js:1
t.current.t.current @ 73630.71be384e.js:1
（匿名） @ async-main.8b0cdf10.js:1
e @ lib-polyfill.b2cb2872.js:1
c @ lib-polyfill.b2cb2872.js:1
Promise.then
e @ lib-polyfill.b2cb2872.js:1
c @ lib-polyfill.b2cb2872.js:1
（匿名） @ lib-polyfill.b2cb2872.js:1
（匿名） @ lib-polyfill.b2cb2872.js:1
（匿名） @ 73630.71be384e.js:1
（匿名） @ lib-polyfill.b2cb2872.js:1
（匿名） @ lib-polyfill.b2cb2872.js:1
（匿名） @ lib-polyfill.b2cb2872.js:1
h @ lib-polyfill.b2cb2872.js:1
n.runAsync @ 73630.71be384e.js:1
n.run @ 73630.71be384e.js:1
n.refresh @ 73630.71be384e.js:1
l @ 73630.71be384e.js:1
c @ 73630.71be384e.js:1
T @ 73630.71be384e.js:1
89771.1092db15.js:1 ErrorBoundary: not found logger instance in either props or context. errorBoundaryName: error-tips
W @ 89771.1092db15.js:1
ak @ lib-react.9d0c9c6b.js:2
up @ lib-react.9d0c9c6b.js:2
i @ lib-react.9d0c9c6b.js:2
oI @ lib-react.9d0c9c6b.js:2
（匿名） @ lib-react.9d0c9c6b.js:2
oO @ lib-react.9d0c9c6b.js:2
ox @ lib-react.9d0c9c6b.js:2
x @ lib-react.9d0c9c6b.js:2
T @ lib-react.9d0c9c6b.js:2
I.<computed> @ main.82bb0835.js:1
T @ main.82bb0835.js:1
P @ main.82bb0835.js:1
89771.1092db15.js:1 IS_RELEASE_VERSION true true
work_flow?space_id=7491691397280874533&workflow_id=7611758866686410792&force_stay=1:1 The resource https://lf-c-flwb.bytetos.com/obj/rc-client-security/web/glue/1.0.0.50/sdk-glue.js was preloaded using link preload but not used within a few seconds from the window's load event. Please make sure it has an appropriate `as` value and it is preloaded intentionally.
work_flow?space_id=7491691397280874533&workflow_id=7611758866686410792&force_stay=1:1 The resource https://lf-c-flwb.bytetos.com/obj/rc-client-security/web/glue/1.0.0.50/sdk-glue.js was preloaded using link preload but not used within a few seconds from the window's load event. Please make sure it has an appropriate `as` value and it is preloaded intentionally.