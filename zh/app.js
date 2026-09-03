const seed = {
  "W1": [
    [
      1,
      "Product Discovery",
      "Stakeholder Interviews",
      "Interview sample users and document their planning needs.",
      "Alex",
      "2026-08-24",
      "2026-08-26",
      "2026-08-24",
      "已完成",
      "Summarize findings.",
      "Demo data only."
    ],
    [
      2,
      "Prototype",
      "Wireframe Review",
      "Review the first planner wireframe with the demo team.",
      "Jordan",
      "2026-08-25",
      "2026-08-28",
      "2026-08-25",
      "进行中",
      "Collect feedback and revise.",
      "No confidential information."
    ],
    [
      3,
      "Operations",
      "Access Checklist",
      "Confirm sample environment access and onboarding steps.",
      "Taylor",
      "2026-08-26",
      "2026-08-28",
      "2026-08-26",
      "未开始",
      "Complete the checklist.",
      "Demo task."
    ]
  ],
  "W2": [
    [
      1,
      "Prototype",
      "Interactive Demo",
      "Build and test the interactive weekly planner demo.",
      "Alex",
      "2026-08-31",
      "2026-09-04",
      "2026-09-01",
      "进行中",
      "Finish usability testing.",
      "Public sample content."
    ],
    [
      2,
      "Product Discovery",
      "Feedback Review",
      "Organize feedback from sample users.",
      "Jordan",
      "2026-08-31",
      "2026-09-03",
      "2026-09-01",
      "已完成",
      "Share the summary.",
      "Demo data only."
    ],
    [
      3,
      "Communication",
      "Team Update",
      "Prepare a short weekly progress update.",
      "Taylor",
      "2026-09-01",
      "2026-09-04",
      "2026-09-01",
      "未开始",
      "Draft the update.",
      "Use fictional information."
    ],
    [
      4,
      "Quality",
      "Demo Testing",
      "Test Calendar, Dashboard, Excel export, and sync behavior.",
      "Alex",
      "2026-09-01",
      "2026-09-04",
      "2026-09-02",
      "进行中",
      "Record test results.",
      "Public test scenario."
    ]
  ],
  "Next 3 Weeks": [
    [
      1,
      "Prototype",
      "Iteration Planning",
      "Prioritize improvements for the next demo iteration.",
      "Alex / Jordan",
      "High",
      "未开始"
    ],
    [
      2,
      "Quality",
      "Regression Testing",
      "Retest the main weekly and daily planning workflows.",
      "Taylor",
      "Medium",
      "未开始"
    ],
    [
      3,
      "Communication",
      "Demo Presentation",
      "Prepare a sample presentation for reviewers.",
      "Demo Team",
      "Medium",
      "未开始"
    ]
  ]
};
const weeklyHeaders=["No.","Category","Topic","Content","Focal Name","Date","Due Date","Last Update","Status","Next Action","Note"];
const futureHeaders=["No.","Category","Topic","Content","Focal Name","Priority","Status"];
localStorage.getItem("demoVersionZh")||localStorage.setItem("demoVersionZh","1");
let data=JSON.parse(localStorage.getItem("financePlanDemoZh")||"null")||seed, active="W2", selectedRow=null, editingRow=null, menuSheet=null, contextRow=null;
let futureSheets=new Set(JSON.parse(localStorage.getItem("futureSheetsDemoZh")||'["Next 3 Weeks"]'));
let dailyPlans=JSON.parse(localStorage.getItem("dailyPlansDemoZh")||"{}");
let pageMeta=JSON.parse(localStorage.getItem("pageMetaDemoZh")||"{}");
for(const row of data["Next 3 Weeks"]||[])if(row.length<7)row.push("未开始");
const $=s=>document.querySelector(s), tbody=$("#tbody"), thead=$("#thead");
function headers(sheet=active){return futureSheets.has(sheet)?futureHeaders:weeklyHeaders}
function statusIndex(sheet=active){return headers(sheet).indexOf("Status")}
function uid(prefix){return `${prefix}_${globalThis.crypto?.randomUUID?.()||`${Date.now()}_${Math.random().toString(36).slice(2)}`}`}
function ensureIds(){const seen=new Set();for(const [sheet,rows] of Object.entries(data)){pageMeta[sheet]??={id:uid("week")};const idIndex=headers(sheet).length;for(const row of rows){if(!row[idIndex]||seen.has(row[idIndex]))row[idIndex]=uid("task");seen.add(row[idIndex])}}for(const sheet of Object.keys(pageMeta))if(!data[sheet])delete pageMeta[sheet]}
function stateJSON(){ensureIds();return JSON.stringify({data,futureSheets:[...futureSheets],dailyPlans,pageMeta})}
let undoStack=[],redoStack=[],lastState=stateJSON();
function updateHistoryButtons(){$("#undoBtn").disabled=!undoStack.length;$("#redoBtn").disabled=!redoStack.length}
function save(record=true){const current=stateJSON();if(record&&current!==lastState){undoStack.push(lastState);if(undoStack.length>50)undoStack.shift();redoStack=[]}lastState=current;localStorage.setItem("financePlanDemoZh",JSON.stringify(data));localStorage.setItem("futureSheetsDemoZh",JSON.stringify([...futureSheets]));localStorage.setItem("dailyPlansDemoZh",JSON.stringify(dailyPlans));localStorage.setItem("pageMetaDemoZh",JSON.stringify(pageMeta));$("#saveState").textContent="All changes saved locally";updateHistoryButtons()}
function restoreState(serialized){const restored=JSON.parse(serialized);data=restored.data;futureSheets=new Set(restored.futureSheets);dailyPlans=restored.dailyPlans||{};pageMeta=restored.pageMeta||{};if(!data[active])active=Object.keys(data)[0];selectedRow=null;lastState=stateJSON();localStorage.setItem("financePlanDemoZh",JSON.stringify(data));localStorage.setItem("futureSheetsDemoZh",JSON.stringify([...futureSheets]));localStorage.setItem("dailyPlansDemoZh",JSON.stringify(dailyPlans));localStorage.setItem("pageMetaDemoZh",JSON.stringify(pageMeta));closeDrawer();closeTabMenu();tabs();render();renderCalendar();renderDashboard();updateHistoryButtons()}
function undo(){if(!undoStack.length)return;redoStack.push(stateJSON());restoreState(undoStack.pop())}
function redo(){if(!redoStack.length)return;undoStack.push(stateJSON());restoreState(redoStack.pop())}
let zoom=100;
function applyZoom(value){zoom=Math.max(60,Math.min(140,Number(value)));$("#zoomRange").value=zoom;$("#zoomValue").textContent=`${zoom}%`;const table=thead.closest("table"),scale=zoom/100;table.style.width=`${zoom}%`;table.style.minWidth=zoom>100?`${zoom}%`:"0";table.style.fontSize=`${14*scale}px`;table.style.setProperty("--table-head-size",`${12*scale}px`);table.style.setProperty("--cell-pad-y",`${12*scale}px`);table.style.setProperty("--cell-pad-x",`${13*scale}px`)}
function badge(value){const c=String(value).toLowerCase().replaceAll(" ","-");return ["done","wip","not-started","high","medium"].includes(c)?`<span class="badge ${c}">${value}</span>`:value}
function esc(value){return String(value??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function safeUrl(value){try{const url=new URL(String(value));return ["http:","https:"].includes(url.protocol)?url.href:""}catch{return ""}}
function linkify(value){const text=esc(value);return text.replace(/https?:\/\/[^\s<]+/g,url=>`<a class="note-link" href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`)}
function dailyIdFromRow(row){return String(row?.[10]||"").match(/\[Daily:([^\]]+)\]/)?.[1]||""}
function findDailyById(id){for(const [date,todos] of Object.entries(dailyPlans))for(const todo of todos)if(todo.syncId===id)return {date,todo};return null}
function isDailyOrphan(row){const id=dailyIdFromRow(row);return Boolean(id&&!findDailyById(id))}
function restoreDailyFromRow(row){const id=dailyIdFromRow(row);if(!id)return;const date=String(row[5]||"").slice(0,10)||dateKey(today),link=String(row[10]||"").match(/https?:\/\/[^\s·]+/)?.[0]||"";(dailyPlans[date]??=[]).push({title:String(row[2]||""),details:String(row[3]||""),link,category:String(row[1]||""),owner:String(row[4]||""),completed:false,syncedTo:active,syncId:id});save();render();alert(`Todo restored to ${date}.`)}
function render(){
  const hs=headers(), si=statusIndex(), q=$("#search").value.toLowerCase(), sf=$("#statusFilter").value;
  thead.innerHTML=`<tr>${hs.map((h,i)=>`<th>${h}<span class="resize-handle" data-resize="${i}"></span></th>`).join("")}</tr>`;
  const rows=data[active].filter(r=>(!q||r.some(v=>String(v).toLowerCase().includes(q)))&&(!sf||r[si]===sf));
  tbody.innerHTML=rows.map(r=>`<tr data-row="${data[active].indexOf(r)}" class="${isDailyOrphan(r)?"daily-orphan":""}">${r.slice(0,hs.length).map((v,ci)=>`<td>${!futureSheets.has(active)&&[5,6,7].includes(ci)?`<span class="date-chip">${esc(v)}</span>`:ci===si?badge(v):headers()[ci]==="Note"?`${linkify(v)}${isDailyOrphan(r)?'<span class="orphan-label">Daily Todo removed</span>':""}`:esc(v)}</td>`).join("")}</tr>`).join("");
  const all=data[active], done=all.filter(r=>r[si]==="已完成").length;
  $("#metrics").innerHTML=`<div class="metric"><b>${all.length}</b><span>items</span></div><div class="metric"><b>${done}</b><span>done</span></div>`;
  $("#sheetTitle").textContent=active==="W1"?"Week 1 · Aug 24 – Aug 28":active==="W2"?"Week 2 · Aug 31 – Sep 4":active;
  $("#statusFilter").disabled=false;
  document.querySelectorAll("tbody tr[data-row]").forEach(row=>{row.onclick=()=>{selectedRow=+row.dataset.row;const item=data[active][selectedRow];if(isDailyOrphan(item)){if(confirm("The linked Daily Todo was deleted. Add it back to Calendar?"))restoreDailyFromRow(item);return}openDrawer(selectedRow)};row.oncontextmenu=e=>{e.preventDefault();contextRow=+row.dataset.row;const menu=$("#rowMenu");menu.style.left=`${Math.min(e.clientX,innerWidth-185)}px`;menu.style.top=`${Math.min(e.clientY,innerHeight-145)}px`;menu.classList.add("open")}});
  document.querySelectorAll(".note-link").forEach(link=>link.onclick=e=>e.stopPropagation());
  enableResize();
  applyZoom(zoom);
}
function tabs(){$("#tabs").innerHTML=Object.keys(data).map(k=>`<span class="tab-item ${k===active?"active":""}"><button data-tab="${esc(k)}">${esc(k)}</button><button class="tab-more" data-more="${esc(k)}">•••</button></span>`).join("")+`<button class="add-sheet" id="addSheet" title="New weekly page">＋</button>`;document.querySelectorAll("[data-tab]").forEach(b=>b.onclick=()=>{active=b.dataset.tab;selectedRow=null;$("#statusFilter").value="";closeTabMenu();tabs();render()});document.querySelectorAll("[data-more]").forEach(b=>b.onclick=e=>openTabMenu(e,b.dataset.more));$("#addSheet").onclick=createSheet}
function uniqueName(base){let name=base,n=2;while(data[name])name=`${base} ${n++}`;return name}
function createSheet(){const proposed=prompt("Name the new weekly page:",uniqueName("New Week"));const name=proposed?.trim();if(!name)return;if(data[name])return alert("A page with this name already exists.");data[name]=[];pageMeta[name]={id:uid("week")};active=name;save();tabs();render()}
function openTabMenu(e,name){e.stopPropagation();menuSheet=name;const menu=$("#tabMenu");menu.style.left=`${Math.min(e.clientX,innerWidth-150)}px`;menu.style.bottom=`${innerHeight-e.clientY+8}px`;menu.classList.add("open")}
function closeTabMenu(){$("#tabMenu").classList.remove("open");menuSheet=null}
$("#renameTab").onclick=()=>{if(!menuSheet)return;const old=menuSheet,name=prompt("Rename page:",old)?.trim();if(!name||name===old)return closeTabMenu();if(data[name])return alert("A page with this name already exists.");const rebuilt={};for(const [key,value] of Object.entries(data))rebuilt[key===old?name:key]=value;data=rebuilt;pageMeta[name]=pageMeta[old]||{id:uid("week")};delete pageMeta[old];for(const todos of Object.values(dailyPlans))for(const todo of todos)if(todo.syncedTo===old)todo.syncedTo=name;if(futureSheets.delete(old))futureSheets.add(name);if(active===old)active=name;save();closeTabMenu();tabs();render()};
$("#duplicateTab").onclick=()=>{if(!menuSheet)return;const source=menuSheet,name=uniqueName(`${source} Copy`);data[name]=structuredClone(data[source]);pageMeta[name]={id:uid("week")};if(futureSheets.has(source))futureSheets.add(name);active=name;save();closeTabMenu();tabs();render()};
$("#deleteTab").onclick=()=>{if(!menuSheet)return;if(Object.keys(data).length===1)return alert("At least one page must remain.");const target=menuSheet;if(!confirm(`Delete “${target}” and all items on this page?`))return;const names=Object.keys(data),index=names.indexOf(target);delete data[target];futureSheets.delete(target);if(active===target)active=Object.keys(data)[Math.max(0,index-1)];save();closeTabMenu();tabs();render()};
document.addEventListener("click",e=>{if(!e.target.closest("#tabMenu")&&!e.target.closest("[data-more]"))closeTabMenu()});
function closeRowMenu(){$("#rowMenu").classList.remove("open")}
$("#contextEdit").onclick=()=>{const row=contextRow;closeRowMenu();if(row!==null)openDrawer(row)};
$("#contextDuplicate").onclick=()=>{if(contextRow===null)return;const copy=structuredClone(data[active][contextRow]);copy[0]=Math.max(0,...data[active].map(r=>+r[0]||0))+1;data[active].splice(contextRow+1,0,copy);save();closeRowMenu();render()};
$("#contextDelete").onclick=()=>{if(contextRow===null)return;if(confirm("Delete this row?")){data[active].splice(contextRow,1);save();render()}closeRowMenu()};
document.addEventListener("click",e=>{if(!e.target.closest("#rowMenu"))closeRowMenu()});
function enableResize(){document.querySelectorAll("[data-resize]").forEach(handle=>handle.onmousedown=e=>{e.preventDefault();e.stopPropagation();const th=handle.parentElement,start=e.clientX,width=th.offsetWidth;const move=ev=>{th.style.width=`${Math.max(70,width+ev.clientX-start)}px`;thead.closest("table").style.width="max-content"};const up=()=>{removeEventListener("mousemove",move);removeEventListener("mouseup",up)};addEventListener("mousemove",move);addEventListener("mouseup",up)})}
function allCategories(){return [...new Set([...Object.values(data).flat().map(r=>String(r[1]||"").trim()),...Object.values(dailyPlans).flat().map(t=>String(t.category||"").trim())].filter(Boolean))].sort((a,b)=>a.localeCompare(b))}
function statusClass(value){return `status-${String(value).toLowerCase().replaceAll(" ","-")}`}
function openDrawer(rowIndex=null){editingRow=rowIndex;const isNew=rowIndex===null,row=isNew?headers().map((_,i)=>i===0?Math.max(0,...data[active].map(r=>+r[0]||0))+1:""):data[active][rowIndex];$("#drawerTitle").textContent=isNew?"New item":"Edit item";$("#deleteRow").style.display=isNew?"none":"block";$("#formFields").innerHTML=headers().map((h,i)=>{const wide=["Content","Next Action","Note"].includes(h),type=["Date","Due Date","Last Update"].includes(h)?"date":"text";let control=`<input name="f${i}" type="${type}" value="${esc(row[i])}">`;if(h==="Category"){const cats=allCategories(),current=String(row[i]||"");if(current&&!cats.includes(current))cats.push(current);control=`<div class="category-picker"><input type="hidden" name="f${i}" id="categoryValue" value="${esc(current)}"><button type="button" class="category-trigger" id="categoryTrigger"><span>${esc(current)||"选择类别……"}</span><b>⌄</b></button><div class="category-menu" id="categoryMenu"><div class="category-options">${cats.map(x=>`<button type="button" data-category="${esc(x)}" class="${current===x?"chosen":""}"><i></i><span>${esc(x)}</span>${current===x?"<b>✓</b>":""}</button>`).join("")}</div><button type="button" class="category-new" id="addCategory">＋ Add new category</button></div></div><input id="newCategory" name="f${i}_new" class="new-category" placeholder="Enter new category" autocomplete="off">`}if(h==="Status")control=`<select name="f${i}" class="status-select ${statusClass(row[i]||"未开始")}">${["未开始","进行中","已完成"].map(x=>`<option class="${statusClass(x)}" ${row[i]===x?"selected":""}>${x}</option>`).join("")}</select>`;if(h==="Priority")control=`<select name="f${i}">${["High","Medium","Low"].map(x=>`<option ${row[i]===x?"selected":""}>${x}</option>`).join("")}</select>`;if(wide)control=`<textarea name="f${i}">${esc(row[i])}</textarea>`;return `<div class="field ${wide?"wide":""}"><label>${h}</label>${control}</div>`}).join("");const trigger=$("#categoryTrigger"),menu=$("#categoryMenu"),value=$("#categoryValue"),newCategory=$("#newCategory");if(trigger){trigger.onclick=()=>menu.classList.toggle("open");menu.querySelectorAll("[data-category]").forEach(b=>b.onclick=()=>{value.value=b.dataset.category;trigger.querySelector("span").textContent=b.dataset.category;menu.classList.remove("open");newCategory.classList.remove("show")});$("#addCategory").onclick=()=>{value.value="__new__";trigger.querySelector("span").textContent="New category";menu.classList.remove("open");newCategory.classList.add("show");setTimeout(()=>newCategory.focus(),0)}}const status=$(".status-select");if(status)status.onchange=()=>{status.className=`status-select ${statusClass(status.value)}`};$("#editDrawer").classList.add("open");$("#drawerBackdrop").classList.add("open")}
function closeDrawer(){$("#editDrawer").classList.remove("open");$("#drawerBackdrop").classList.remove("open");editingRow=null}
function enhanceStatusPicker(){const select=$(".status-select");if(!select||select.dataset.enhanced)return;select.dataset.enhanced="true";const name=select.name,current=select.value,wrap=document.createElement("div");wrap.className="status-picker";wrap.innerHTML=`<input type="hidden" name="${name}" value="${esc(current)}"><button type="button" class="status-trigger"><span>${esc(current)}</span><b>⌄</b></button><div class="status-menu">${["未开始","进行中","已完成"].map(x=>`<button type="button" data-status="${x}" class="${statusClass(x)} ${x===current?"chosen":""}"><i></i><span>${x}</span><b>${x===current?"✓":""}</b></button>`).join("")}</div>`;select.replaceWith(wrap);const trigger=wrap.querySelector(".status-trigger"),menu=wrap.querySelector(".status-menu"),input=wrap.querySelector("input");trigger.onclick=()=>menu.classList.toggle("open");menu.querySelectorAll("[data-status]").forEach(button=>button.onclick=()=>{input.value=button.dataset.status;trigger.querySelector("span").textContent=button.dataset.status;menu.querySelectorAll("button").forEach(x=>{x.classList.toggle("chosen",x===button);x.querySelector("b").textContent=x===button?"✓":""});menu.classList.remove("open")})}
new MutationObserver(()=>enhanceStatusPicker()).observe($("#formFields"),{childList:true});
$("#rowForm").onsubmit=e=>{e.preventDefault();const form=new FormData(e.currentTarget),row=headers().map((_,i)=>{const value=form.get(`f${i}`)||"";return value==="__new__"?String(form.get(`f${i}_new`)||"").trim():value}),taskId=editingRow===null?uid("task"):data[active][editingRow][headers().length]||uid("task");if(!row[1])return alert("Please select or add a Category.");row.push(taskId);if(editingRow===null)data[active].push(row);else data[active][editingRow]=row;if(pendingTodoSync){const todo=dailyPlans[pendingTodoSync.date]?.[pendingTodoSync.index];if(todo){todo.syncedTo=active;todo.syncId=pendingTodoSync.id}pendingTodoSync=null}save();closeDrawer();render()}
$("#deleteRow").onclick=()=>{if(editingRow!==null&&confirm("Delete this item?")){data[active].splice(editingRow,1);save();closeDrawer();render()}};
$("#closeDrawer").onclick=$("#cancelRow").onclick=$("#drawerBackdrop").onclick=()=>{pendingTodoSync=null;closeDrawer()};
$("#editBtn").onclick=()=>selectedRow===null?alert("Select a row first, or double-click any item to edit it."):openDrawer(selectedRow);
$("#addBtn").onclick=()=>openDrawer(null);
$("#search").oninput=render;$("#statusFilter").onchange=render;
$("#undoBtn").onclick=undo;$("#redoBtn").onclick=redo;
document.addEventListener("keydown",e=>{if(e.target.matches("input, textarea, [contenteditable=true]"))return;const command=e.metaKey||e.ctrlKey;if(!command)return;if(e.key.toLowerCase()==="z"){e.preventDefault();e.shiftKey?redo():undo()}else if(e.ctrlKey&&e.key.toLowerCase()==="y"){e.preventDefault();redo()}});
$("#zoomRange").oninput=e=>applyZoom(e.target.value);$("#zoomOut").onclick=()=>applyZoom(zoom-10);$("#zoomIn").onclick=()=>applyZoom(zoom+10);$("#zoomValue").onclick=()=>applyZoom(100);
$(".tablewrap").addEventListener("wheel",e=>{if(!e.ctrlKey&&!e.metaKey)return;e.preventDefault();applyZoom(zoom+(e.deltaY<0?5:-5))},{passive:false});
$("#exportBtn").onclick=async()=>{const wb=new ExcelJS.Workbook();Object.entries(data).forEach(([name,rows])=>{const ws=wb.addWorksheet(name);ws.addRows([[...headers(name),"_Task ID"],...rows]);ws.getRow(1).font={bold:true,color:{argb:"FFFFFFFF"}};ws.getRow(1).fill={type:"pattern",pattern:"solid",fgColor:{argb:"FFD71920"}};ws.views=[{state:"frozen",ySplit:1}];ws.columns.forEach(c=>c.width=18)});const buffer=await wb.xlsx.writeBuffer();const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([buffer],{type:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"}));a.download="Finance_DT_Weekly_Plan.xlsx";a.click();URL.revokeObjectURL(a.href)};
$("#importInput").onchange=async e=>{try{const wb=new ExcelJS.Workbook();await wb.xlsx.load(await e.target.files[0].arrayBuffer());const next={},nextFuture=new Set();for(const ws of wb.worksheets){const heading=ws.getRow(1).values.slice(1).map(String);if(heading.includes("Priority")&&!heading.includes("Due Date"))nextFuture.add(ws.name);const rows=[];ws.eachRow((row,n)=>{if(n>1){const values=row.values.slice(1).map(v=>v instanceof Date?v.toISOString().slice(0,10):v?.text??v??"");if(values.some(v=>v!==""))rows.push(values)}});next[ws.name]=rows}if(!Object.keys(next).length)throw Error();data=next;futureSheets=nextFuture;active=Object.keys(data)[0];save();tabs();render()}catch{alert("Please select a valid weekly-plan Excel workbook.")}};
function toggleAgent(show){$("#agent").classList.toggle("hidden",show===false||!$("#agent").classList.contains("hidden")&&show===undefined)}
$("#closeAgent").onclick=()=>toggleAgent(false);$("#railAI").onclick=()=>$("#agent").classList.toggle("hidden");
$("#privacyBtn").onclick=()=>$("#privacyDialog").showModal();
$("#remoteToggle").checked=localStorage.getItem("useRemoteAI")==="true";
$("#remoteToggle").onchange=e=>{localStorage.setItem("useRemoteAI",e.target.checked);updatePrivacy()};
function updatePrivacy(){const on=$("#remoteToggle").checked;$("#privacyModeText").textContent=on?"Connected mode: visible sheet is sent securely through your server.":"Local mode: your plan stays in this browser."}
function localAnswer(msg){const rows=data[active],si=statusIndex(),done=rows.filter(r=>r[si]==="已完成").length,wip=rows.filter(r=>r[si]==="进行中"),future=futureSheets.has(active);if(/risk|block|overdue/i.test(msg))return wip.length?`可能需要关注：\n${wip.map(r=>future?`• ${r[2]} — ${r[3]}`:`• ${r[2]} — due ${r[6]}; next: ${r[9]}`).join("\n")}`:"当前页面没有进行中的任务。";if(/priorit|next/i.test(msg))return future?rows.filter(r=>r[5]==="High").map(r=>`• ${r[2]} — ${r[3]}`).join("\n"):`建议重点：\n${wip.slice(0,3).map(r=>`• ${r[2]}: ${r[9]}`).join("\n")}`;return `${active} has ${rows.length} items: ${done} done and ${wip.length} in progress. ${wip.length?`Current focus is ${wip.map(r=>r[2]).join(", ")}.`:"当前没有未完成工作。"}`}
function showAIProposal(action,sheet){const card=document.createElement("div"),args=action.arguments||{};card.className="ai-proposal";card.innerHTML=`<b>建议的更改</b><p>${esc(args.reason||"Please review this change.")}</p><div class="proposal-detail">${Object.entries(args).filter(([k])=>k!=="reason").map(([k,v])=>`<span><small>${esc(k.replaceAll("_"," "))}</small>${esc(v)}</span>`).join("")}</div><div><button class="proposal-reject">忽略</button><button class="proposal-apply">应用更改</button></div>`;card.querySelector(".proposal-reject").onclick=()=>card.remove();card.querySelector(".proposal-apply").onclick=()=>{if(action.type==="propose_task_update"){let found=null;for(const [name,rows] of Object.entries(data)){const i=headers(name).length,row=rows.find(r=>r[i]===args.task_id);if(row){found={name,row};break}}if(!found)return alert("This task no longer exists.");const col=headers(found.name).indexOf(args.field);if(col<0)return alert("This field is not available on the task.");found.row[col]=args.value}else if(action.type==="propose_new_task"){if(!data[sheet])return alert("The target page no longer exists.");const now=dateKey(new Date()),row=[data[sheet].length+1,args.category,args.topic,args.content,args.owner,now,args.due_date||now,now,args.status,args.next_action,"Created from an approved AI proposal",uid("task")];data[sheet].push(row)}save();render();card.classList.add("applied");card.innerHTML="✓ 更改已应用"};$("#chat").append(card);card.scrollIntoView({behavior:"smooth"})}
async function ask(message){addBubble(message,"user");const loading=addBubble("思考中……","ai"),requestSheet=active;try{if(!$("#remoteToggle").checked){loading.textContent=localAnswer(message);return}const r=await fetch("/api/ai",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({message,plan:{sheet:active,headers:[...headers(),"_Task ID"],rows:data[active]}})});const out=await r.json();loading.textContent=r.ok?out.text:out.error==="AI_NOT_CONFIGURED"?"Connected AI is not configured yet. Add OPENAI_API_KEY on the server, or switch back to Local mode.":`AI error: ${out.error}`;if(r.ok)(out.actions||[]).forEach(action=>showAIProposal(action,requestSheet))}catch(e){loading.textContent="无法连接 AI 服务，你的计划仍保存在本地。"}}
function addBubble(text,type){const d=document.createElement("div");d.className=`bubble ${type}`;d.textContent=text;$("#chat").append(d);d.scrollIntoView({behavior:"smooth"});return d}
$("#chatForm").onsubmit=e=>{e.preventDefault();const i=$("#chatInput"),m=i.value.trim();if(m){i.value="";ask(m)}};document.querySelectorAll(".suggestions button").forEach(b=>b.onclick=()=>ask(b.textContent));
const today=new Date(),pad=n=>String(n).padStart(2,"0"),dateKey=d=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
let calendarMonth=new Date(today.getFullYear(),today.getMonth(),1),selectedDate=dateKey(today),todoEditingIndex=null,pendingTodoSync=null;
function weeklyTargets(){return Object.keys(data).filter(name=>!futureSheets.has(name))}
function showCalendar(show=true){$("#weeklyView").classList.toggle("hidden",show);$("#calendarView").classList.toggle("hidden",!show);$("#dashboardView").classList.add("hidden");$("#calendarBtn").classList.toggle("selected",show);$("#dashboardBtn").classList.remove("selected");$("#weeklyBtn").classList.toggle("selected",!show);if(show){$("#agent").classList.add("hidden");renderCalendar()}else render()}
function renderCalendar(){const year=calendarMonth.getFullYear(),month=calendarMonth.getMonth(),first=new Date(year,month,1),start=new Date(year,month,1-first.getDay());$("#monthTitle").textContent=calendarMonth.toLocaleDateString("en-US",{month:"long",year:"numeric"});$("#selectedDateTitle").textContent=new Date(`${selectedDate}T12:00:00`).toLocaleDateString("en-US",{weekday:"long",month:"short",day:"numeric"});$("#calendarGrid").innerHTML=Array.from({length:42},(_,i)=>{const d=new Date(start);d.setDate(start.getDate()+i);const key=dateKey(d),todos=dailyPlans[key]||[];return `<button class="calendar-day ${d.getMonth()!==month?"other":""} ${key===selectedDate?"selected":""} ${key===dateKey(today)?"today":""}" data-date="${key}"><span class="day-number">${d.getDate()}</span>${todos.length?`<span class="todo-count">${todos.length} todo${todos.length>1?"s":""}</span>`:""}</button>`}).join("");document.querySelectorAll("[data-date]").forEach(b=>b.onclick=()=>{selectedDate=b.dataset.date;const d=new Date(`${selectedDate}T12:00:00`);calendarMonth=new Date(d.getFullYear(),d.getMonth(),1);renderCalendar()});renderTodos()}
function weeklyTodoExists(todo){if(!todo.syncedTo||!data[todo.syncedTo])return false;return data[todo.syncedTo].some(row=>todo.syncId?String(row[10]||"").includes(todo.syncId):row[1]===todo.category&&row[2]===todo.title)}
function mirrorTodoCompletion(todo){if(!todo.syncedTo||!data[todo.syncedTo])return;const row=data[todo.syncedTo].find(item=>todo.syncId?String(item[10]||"").includes(todo.syncId):item[1]===todo.category&&item[2]===todo.title);if(!row)return;if(todo.completed){if(row[8]!=="已完成")todo.weeklyStatusBeforeDone=row[8]||"未开始";row[8]="已完成"}else if(row[8]==="已完成")row[8]=todo.weeklyStatusBeforeDone||"进行中"}
function renderTodos(){const todos=dailyPlans[selectedDate]||[],target=weeklyTargets().includes(active)?active:weeklyTargets()[0];$("#todoList").innerHTML=todos.length?todos.map((todo,i)=>{const missing=todo.syncedTo&&!weeklyTodoExists(todo);return `<article class="todo-card ${todo.completed?"completed":""} ${missing?"missing-sync":""}" data-edit-todo="${i}"><button class="todo-check ${todo.completed?"done":""}" data-check-todo="${i}" title="Mark ${todo.completed?"not completed":"completed"}">${todo.completed?"✓":""}</button><div class="todo-card-body"><h3>${esc(todo.title)}</h3>${todo.details?`<p>${esc(todo.details)}</p>`:""}<div class="todo-meta">${todo.category?`<span class="todo-category">${esc(todo.category)}</span>`:""}${todo.owner?`<small>${esc(todo.owner)}</small>`:""}${missing?`<span class="sync-missing">已从以下页面删除：${esc(todo.syncedTo)}</span>`:todo.syncedTo?`<span class="synced">✓ 已同步到${esc(todo.syncedTo)}</span>`:`<button data-sync-todo="${i}">同步到${esc(target||"Weekly")}</button>`}</div></div></article>`}).join(""):`<div class="todo-empty">暂无计划。<br>点击“添加待办”开始安排。</div>`;document.querySelectorAll("[data-edit-todo]").forEach(card=>card.onclick=()=>openTodo(+card.dataset.editTodo));document.querySelectorAll("[data-check-todo]").forEach(b=>b.onclick=e=>{e.stopPropagation();const todo=todos[+b.dataset.checkTodo];todo.completed=!todo.completed;save();renderCalendar()});document.querySelectorAll("[data-sync-todo]").forEach(b=>b.onclick=e=>{e.stopPropagation();prepareWeeklySync(+b.dataset.syncTodo,target)})}
new MutationObserver(()=>{document.querySelectorAll(".todo-card:not([data-link-ready])").forEach(card=>{card.dataset.linkReady="true";const todo=(dailyPlans[selectedDate]||[])[+card.dataset.editTodo],url=safeUrl(todo?.link);if(!url)return;const a=document.createElement("a");a.className="todo-link";a.href=url;a.target="_blank";a.rel="noopener noreferrer";a.textContent="↗ 打开链接";a.onclick=e=>e.stopPropagation();card.querySelector(".todo-card-body")?.insertBefore(a,card.querySelector(".todo-meta"))})}).observe($("#todoList"),{childList:true,subtree:true});
new MutationObserver(()=>{document.querySelectorAll(".todo-card.missing-sync:not([data-syncback-ready])").forEach(card=>{card.dataset.syncbackReady="true";const index=+card.dataset.editTodo,todo=(dailyPlans[selectedDate]||[])[index];if(!todo)return;const button=document.createElement("button");button.type="button";button.className="sync-back";button.textContent="↻ 重新同步";button.onclick=e=>{e.stopPropagation();prepareWeeklySync(index,todo.syncedTo||weeklyTargets()[0])};card.querySelector(".todo-meta")?.append(button)})}).observe($("#todoList"),{childList:true,subtree:true});
function goToWeeklyTodo(todo){if(!todo.syncedTo||!data[todo.syncedTo])return;active=todo.syncedTo;$("#search").value="";$("#statusFilter").value="";showCalendar(false);tabs();render();const rowIndex=data[active].findIndex(row=>todo.syncId?String(row[10]||"").includes(todo.syncId):row[1]===todo.category&&row[2]===todo.title),row=document.querySelector(`tbody tr[data-row="${rowIndex}"]`);if(row){row.scrollIntoView({behavior:"smooth",block:"center",inline:"center"});row.classList.add("linked-highlight");setTimeout(()=>row.classList.remove("linked-highlight"),2200)}}
new MutationObserver(()=>{document.querySelectorAll(".todo-card:not(.missing-sync):not([data-weekly-link-ready])").forEach(card=>{card.dataset.weeklyLinkReady="true";const todo=(dailyPlans[selectedDate]||[])[+card.dataset.editTodo];if(!todo?.syncedTo)return;const button=document.createElement("button");button.type="button";button.className="view-weekly";button.textContent="在周计划中查看 →";button.onclick=e=>{e.stopPropagation();goToWeeklyTodo(todo)};card.querySelector(".todo-meta")?.append(button)})}).observe($("#todoList"),{childList:true,subtree:true});
$("#todoList").addEventListener("click",e=>{const button=e.target.closest("[data-check-todo]");if(!button)return;e.preventDefault();e.stopImmediatePropagation();const todo=(dailyPlans[selectedDate]||[])[+button.dataset.checkTodo];if(!todo)return;todo.completed=!todo.completed;mirrorTodoCompletion(todo);save();renderCalendar()},{capture:true});
$("#rowForm").addEventListener("submit",()=>{if(!pendingTodoSync)return;const todo=dailyPlans[pendingTodoSync.date]?.[pendingTodoSync.index];if(!todo?.completed)return;const statusField=$("#rowForm").elements[`f${statusIndex()}`];if(statusField)statusField.value="已完成"},{capture:true});
function prepareWeeklySync(index,target){if(!target)return alert("请先创建一个周计划页面。");const todo=dailyPlans[selectedDate][index],id=todo.syncId||`${Date.now()}-${Math.random().toString(36).slice(2,8)}`;pendingTodoSync={date:selectedDate,index,target,id};$("#todoDialog").close();active=target;showCalendar(false);tabs();render();openDrawer(null);const link=todo.link?` · ${todo.link}`:"",values={Category:todo.category,Topic:todo.title,Content:todo.details,"Focal Name":todo.owner,Date:selectedDate,"Due Date":selectedDate,"Last Update":selectedDate,Status:"未开始",Note:`Synced from Daily Plan · ${selectedDate}${link} · [Daily:${id}]`};for(const [label,value] of Object.entries(values)){const i=headers().indexOf(label);if(i<0)continue;if(label==="Category"){const hidden=$("#categoryValue");if(hidden){hidden.value=value||"";$("#categoryTrigger span").textContent=value||"选择类别……"}}else{const input=$("#rowForm").elements[`f${i}`];if(input)input.value=value||""}}}
function openTodo(index=null){todoEditingIndex=index;const todo=index===null?null:(dailyPlans[selectedDate]||[])[index];$("#todoForm").reset();$("#todoDialogTitle").textContent=todo?"编辑待办":"添加待办";$("#saveTodo").textContent=todo?"保存更改":"添加待办";$("#deleteTodo").style.display=todo?"block":"none";if(todo){const form=$("#todoForm").elements;form.title.value=todo.title;form.details.value=todo.details||"";form.link.value=todo.link||""}$("#todoDialog").showModal()}
$("#calendarBtn").onclick=()=>showCalendar(true);$("#weeklyBtn").onclick=$("#backToWeekly").onclick=()=>showCalendar(false);$("#refreshBtn").onclick=()=>location.reload();$("#prevMonth").onclick=()=>{calendarMonth=new Date(calendarMonth.getFullYear(),calendarMonth.getMonth()-1,1);renderCalendar()};$("#nextMonth").onclick=()=>{calendarMonth=new Date(calendarMonth.getFullYear(),calendarMonth.getMonth()+1,1);renderCalendar()};$("#todayBtn").onclick=()=>{selectedDate=dateKey(today);calendarMonth=new Date(today.getFullYear(),today.getMonth(),1);renderCalendar()};$("#addTodo").onclick=()=>openTodo(null);$("#closeTodo").onclick=$("#cancelTodo").onclick=()=>$("#todoDialog").close();$("#deleteTodo").onclick=()=>{if(todoEditingIndex===null)return;if(confirm("确定删除此待办吗？")){dailyPlans[selectedDate].splice(todoEditingIndex,1);if(!dailyPlans[selectedDate].length)delete dailyPlans[selectedDate];save();$("#todoDialog").close();renderCalendar()}};
$("#monthTitle").onclick=()=>{const month=calendarMonth.getMonth(),year=calendarMonth.getFullYear(),months=Array.from({length:12},(_,i)=>new Date(2000,i,1).toLocaleDateString("en-US",{month:"long"}));$("#monthWheel").innerHTML=months.map((name,i)=>`<option value="${i}" ${i===month?"selected":""}>${name}</option>`).join("");$("#yearWheel").innerHTML=Array.from({length:41},(_,i)=>year-20+i).map(y=>`<option ${y===year?"selected":""}>${y}</option>`).join("");$("#monthPicker").showModal();setTimeout(()=>{$("#monthWheel").selectedOptions[0]?.scrollIntoView({block:"center"});$("#yearWheel").selectedOptions[0]?.scrollIntoView({block:"center"})},0)};
$("#applyMonth").onclick=()=>{const month=Number($("#monthWheel").value),year=Number($("#yearWheel").value);calendarMonth=new Date(year,month,1);selectedDate=dateKey(calendarMonth);renderCalendar()};
$("#todoForm").onsubmit=e=>{e.preventDefault();const form=new FormData(e.currentTarget),previous=todoEditingIndex===null?null:dailyPlans[selectedDate][todoEditingIndex],link=String(form.get("link")||"").trim();if(link&&!safeUrl(link))return alert("请输入有效的 http:// 或 https:// 链接。");const todo={title:String(form.get("title")),details:String(form.get("details")||""),link,category:previous?.category||"",owner:previous?.owner||"",completed:previous?.completed||false,syncedTo:previous?.syncedTo||null,syncId:previous?.syncId||null};if(todoEditingIndex===null)(dailyPlans[selectedDate]??=[]).push(todo);else dailyPlans[selectedDate][todoEditingIndex]=todo;save();$("#todoDialog").close();renderCalendar()};
function showDashboard(){$("#weeklyView").classList.add("hidden");$("#calendarView").classList.add("hidden");$("#dashboardView").classList.remove("hidden");$("#weeklyBtn").classList.remove("selected");$("#calendarBtn").classList.remove("selected");$("#dashboardBtn").classList.add("selected");$("#agent").classList.add("hidden");renderDashboard()}
function dashboardSheets(){return Object.keys(data).filter(name=>!futureSheets.has(name))}
function renderDashboard(){const sheets=dashboardSheets();if(!sheets.length)return;const select=$("#dashboardWeek"),current=select.value&&data[select.value]?select.value:(sheets.includes(active)?active:sheets[0]);select.innerHTML=sheets.map(name=>`<option ${name===current?"selected":""}>${esc(name)}</option>`).join("");const rows=data[current],si=statusIndex(current),done=rows.filter(r=>r[si]==="已完成").length,wip=rows.filter(r=>r[si]==="进行中").length,notStarted=rows.length-done-wip,completion=rows.length?Math.round(done/rows.length*100):0,now=dateKey(today),overdue=rows.filter(r=>r[6]&&String(r[6]).slice(0,10)<now&&r[si]!=="已完成");$("#dashboardCards").innerHTML=[["任务总数",rows.length,""],["完成率",`${completion}%`,"success"],["DONE",done,"success"],["进行中",wip,""],["已逾期",overdue.length,"danger"]].map(([label,value,cls])=>`<article class="dash-card ${cls}"><span>${label}</span><b>${value}</b></article>`).join("");const donePct=rows.length?done/rows.length*100:0,wipPct=rows.length?wip/rows.length*100:0;$("#statusOverview").innerHTML=`<div class="status-layout"><div class="status-donut" style="background:conic-gradient(#178b50 0 ${donePct}%,#e5a400 ${donePct}% ${donePct+wipPct}%,#1769c2 ${donePct+wipPct}% 100%)"></div><div class="status-legend">${[["已完成",done,"#178b50"],["进行中",wip,"#e5a400"],["未开始",notStarted,"#1769c2"]].map(x=>`<div class="legend-row"><i style="background:${x[2]}"></i><span>${x[0]}</span><b>${x[1]}</b></div>`).join("")}</div></div>`;const counts={};rows.forEach(r=>counts[r[1]||"Uncategorized"]=(counts[r[1]||"Uncategorized"]||0)+1);const max=Math.max(1,...Object.values(counts));$("#categoryBreakdown").innerHTML=Object.entries(counts).sort((a,b)=>b[1]-a[1]).map(([name,count])=>`<div class="category-row"><div class="category-label"><span>${esc(name)}</span><b>${count}</b></div><div class="category-bar"><i style="width:${count/max*100}%"></i></div></div>`).join("")||'<div class="empty-state">暂无类别</div>';const attention=[...overdue.map(r=>({r,label:"Overdue"})),...rows.filter(r=>r[si]==="进行中"&&!overdue.includes(r)).map(r=>({r,label:"进行中"}))].slice(0,6);$("#attentionList").innerHTML=attention.length?attention.map(x=>`<div class="attention-item"><i></i><div><b>${esc(x.r[2])}</b><br><small>${esc(x.r[1])}</small></div><small>${x.label}</small></div>`).join(""):'<div class="empty-state">暂无需关注事项</div>';const dates=rows.map(r=>String(r[5]||"").slice(0,10)).filter(Boolean).sort(),start=dates[0]||"0000",end=dates.at(-1)||"9999",todos=Object.entries(dailyPlans).filter(([date])=>date>=start&&date<=end).flatMap(([,items])=>items),synced=todos.filter(t=>t.syncedTo===current&&weeklyTodoExists(t)).length,broken=todos.filter(t=>t.syncedTo===current&&!weeklyTodoExists(t)).length;$("#dailyHealth").innerHTML=`<div class="health-row"><span>每日待办</span><b>${todos.length}</b></div><div class="health-row good"><span>已完成待办</span><b>${todos.filter(t=>t.completed).length}</b></div><div class="health-row good"><span>已同步到this Week</span><b>${synced}</b></div><div class="health-row ${broken?"warn":"good"}"><span>失效的同步关联</span><b>${broken}</b></div>`;const index=sheets.indexOf(current),previous=index>0?data[sheets[index-1]]:null,previousRate=previous?.length?Math.round(previous.filter(r=>r[statusIndex(sheets[index-1])]==="已完成").length/previous.length*100):null;$("#weekComparison").textContent=previousRate===null?"无上一周数据":"上一周："+previousRate+"% · "+(completion-previousRate>=0?"+":"")+(completion-previousRate)+" pts"}
$("#dashboardBtn").onclick=showDashboard;$("#dashboardRefresh").onclick=renderDashboard;$("#dashboardWeek").onchange=renderDashboard;
updatePrivacy();applyZoom(zoom);tabs();render();save(false);
