
let TOKEN=null; let CURRENT_USER=null;
async function api(path, opts={}){
  const headers = opts.headers||{}; if(TOKEN) headers['Authorization']='Bearer '+TOKEN;
  if(!(opts.body instanceof FormData)) headers['Content-Type']=headers['Content-Type']||'application/json';
  const r=await fetch(BASE_URL+path,{...opts,headers});
  if(!r.ok) throw new Error(await r.text());
  return r.headers.get('content-type')?.includes('application/json')?r.json():r.text();
}

const loginLink=document.getElementById('loginLink');
const loginModal=document.getElementById('loginModal');
const closeLogin=document.getElementById('closeLogin');
const loginBtn=document.getElementById('loginBtn');
const registerBtn=document.getElementById('registerBtn');
const startNow=document.getElementById('startNow');

loginLink.addEventListener('click',e=>{e.preventDefault();loginModal.classList.remove('hidden');});
closeLogin.addEventListener('click',()=>loginModal.classList.add('hidden'));
loginBtn.addEventListener('click',async()=>{
  const email=document.getElementById('email').value.trim();
  const password=document.getElementById('password').value;
  try{const d=await api('/api/auth/login',{method:'POST',body:JSON.stringify({email,password})});TOKEN=d.token;CURRENT_USER=d.user;loginModal.classList.add('hidden');routeAfterLogin();}catch(e){alert('Login failed');}
});
registerBtn.addEventListener('click',async()=>{
  const email=document.getElementById('email').value.trim();
  const password=document.getElementById('password').value;
  try{const d=await api('/api/auth/register',{method:'POST',body:JSON.stringify({email,password})});TOKEN=d.token;CURRENT_USER=d.user;loginModal.classList.add('hidden');routeAfterLogin();}catch(e){alert('Register failed');}
});
startNow.addEventListener('click',routeAfterLogin);

function routeAfterLogin(){
  if(!TOKEN){loginModal.classList.remove('hidden');return;}
  document.getElementById('upload').classList.remove('hidden');
  document.getElementById('dashboard').classList.remove('hidden');
  refreshMyCase(); loadMyDocs();
  if(CURRENT_USER?.role==='admin'){document.getElementById('admin').classList.remove('hidden'); loadAllDocs();}
}

const dropzone=document.getElementById('dropzone');
const fileInput=document.getElementById('fileInput');
const fileList=document.getElementById('fileList');
const docsList=document.getElementById('docs');
const caseStatus=document.getElementById('caseStatus');
const requestEstimate=document.getElementById('requestEstimate');
const browseBtn=document.getElementById('browseBtn');
const estimateBox=document.getElementById('estimateBox');

browseBtn.addEventListener('click',()=>fileInput.click());
fileInput.addEventListener('change',e=>handleFiles(e.target.files));
['dragenter','dragover'].forEach(evt=>dropzone.addEventListener(evt,e=>{e.preventDefault();dropzone.style.borderColor='#00bcd4';}));
['dragleave','drop'].forEach(evt=>dropzone.addEventListener(evt,e=>{e.preventDefault();dropzone.style.borderColor='#94a3b8';}));
dropzone.addEventListener('drop',e=>handleFiles(e.dataTransfer.files));

async function handleFiles(files){
  for(const f of files){const fd=new FormData(); fd.append('file',f); try{await api('/api/docs/upload',{method:'POST',body:fd});}catch(e){alert('Upload failed: '+f.name);} }
  loadMyDocs();
}
async function loadMyDocs(){
  try{const rows=await api('/api/docs/my'); fileList.innerHTML=rows.map(d=>`<li>📄 ${d.original_name} — ${(d.size/1024).toFixed(1)} KB</li>`).join(''); docsList.innerHTML=fileList.innerHTML;}catch(e){console.error(e);}
}
async function refreshMyCase(){
  try{const row=await api('/api/cases/my'); caseStatus.textContent=row?.status||'Draft';}catch(e){console.error(e);}
}
requestEstimate.addEventListener('click',async()=>{
  const income=Number(document.getElementById('income').value||0);
  const deductions=Number(document.getElementById('deductions').value||0);
  try{const data=await api('/api/estimate/mock',{method:'POST',body:JSON.stringify({income,deductions})}); estimateBox.textContent=JSON.stringify(data,null,2);}catch(e){estimateBox.textContent='Error';}
});

const btnUpdateStatus=document.getElementById('btnUpdateStatus');
btnUpdateStatus.addEventListener('click',async()=>{
  const email=document.getElementById('userEmailStatus').value.trim();
  const status=document.getElementById('newStatus').value;
  try{await api('/api/cases/status',{method:'POST',body:JSON.stringify({email,status})}); if(CURRENT_USER?.role==='admin') loadAllDocs();}catch(e){alert('Update failed');}
});
async function loadAllDocs(){
  try{const rows=await api('/api/docs/all'); const tbody=document.querySelector('#adminTable tbody'); tbody.innerHTML=rows.map(r=>`<tr><td>${r.user}</td><td>${r.original_name}</td><td>${r.mime_type}</td><td>${(r.size/1024).toFixed(1)}</td><td>${new Date(r.uploaded_at).toLocaleString()}</td><td><button class='btn' onclick="document.getElementById('userEmailStatus').value='${r.user}'">Select</button></td></tr>`).join(''); }catch(e){console.error(e);}
}
