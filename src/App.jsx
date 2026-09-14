import React from "react";
import { BrowserRouter, Routes,
Route } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { Link, NavLink, useNavigate, useParams } from "react-router-dom";
import {
  Bell, BookOpen, CheckCircle2, ChevronRight, CircleUserRound, FileSearch,
  HeartHandshake, Home, LayoutDashboard, LogIn, LogOut, MapPin, Menu,
  PackageSearch, Plus, Search, ShieldCheck, Sparkles, UserPlus, X
} from "lucide-react";
import { seedData, makeId } from "./data/sampleData";
import { calculateMatch } from "./utils/matching";

const KEY = "campusfind_data";
const USER_KEY = "campusfind_user";

function loadData() {
  const saved = localStorage.getItem(KEY);
  if (saved) return JSON.parse(saved);
  localStorage.setItem(KEY, JSON.stringify(seedData));
  return seedData;
}

function App() {
  const [data, setData] = useState(loadData);
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem(USER_KEY) || "null"));
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => localStorage.setItem(KEY, JSON.stringify(data)), [data]);

  const updateData = (patch) => setData(prev => ({ ...prev, ...patch }));

  const login = (account) => {
    setUser(account);
    localStorage.setItem(USER_KEY, JSON.stringify(account));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(USER_KEY);
  };

  return (
    <div className="app">
      <header className="navbar">
        <Link to="/" className="brand" onClick={() => setMenuOpen(false)}>
          <span className="brand-mark"><PackageSearch size={22}/></span>
          <span>Campus<span>Find</span></span>
        </Link>
        <button className="mobile-menu" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X/> : <Menu/>}
        </button>
        <nav className={menuOpen ? "nav-links open" : "nav-links"}>
          <NavLink to="/">Home</NavLink>
          <NavLink to="/browse">Browse</NavLink>
          <NavLink to="/matches">Matches</NavLink>
          {user && <NavLink to="/dashboard">Dashboard</NavLink>}
          {user?.role === "admin" && <NavLink to="/admin">Admin</NavLink>}
          {user ? (
            <button className="nav-login" onClick={logout}><LogOut size={17}/> Logout</button>
          ) : (
            <Link className="nav-login" to="/login"><LogIn size={17}/> Login</Link>
          )}
        </nav>
      </header>

      <main>
        <Routes>
          <Route path="/" element={<HomePage data={data}/>} />
          <Route path="/browse" element={<BrowsePage data={data}/>} />
          <Route path="/matches" element={<MatchesPage data={data}/>} />
          <Route path="/login" element={<LoginPage login={login} data={data}/>} />
          <Route path="/signup" element={<SignupPage login={login} data={data} updateData={updateData}/>} />
          <Route path="/report/lost" element={<Protected user={user}><ReportPage type="lost" user={user} data={data} updateData={updateData}/></Protected>} />
          <Route path="/report/found" element={<Protected user={user}><ReportPage type="found" user={user} data={data} updateData={updateData}/></Protected>} />
          <Route path="/item/:type/:id" element={<ItemPage data={data} user={user} updateData={updateData}/>} />
          <Route path="/dashboard" element={<Protected user={user}><Dashboard data={data} user={user} updateData={updateData}/></Protected>} />
          <Route path="/admin" element={<Protected user={user} role="admin"><AdminPage data={data} updateData={updateData}/></Protected>} />
          <Route path="*" element={<NotFound/>}/>
        </Routes>
      </main>

      <footer>
        <div><b>CampusFind</b> · A simple college lost & found project</div>
        <div>Built for academic demonstration</div>
      </footer>
    </div>
  );
}

function Protected({ user, role, children }) {
  if (!user) return <NavigateTo to="/login"/>;
  if (role && user.role !== role) return <NavigateTo to="/"/>;
  return children;
}

function NavigateTo({to}) {
  const navigate = useNavigate();
  useEffect(() => navigate(to, {replace:true}), [navigate,to]);
  return <div className="page center"><div className="loader"></div></div>;
}

function HomePage({data}) {
  const stats = {
    lost: data.lostItems.length,
    found: data.foundItems.length,
    returned: data.foundItems.filter(x => x.status === "Returned").length,
    matches: data.matches.length
  };
  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow"><Sparkles size={15}/> College Lost & Found</div>
          <h1>Lost something on campus?<br/><em>Let's find it.</em></h1>
          <p>CampusFind connects students and staff who lose or find belongings, with simple matching and secure claim verification.</p>
          <div className="hero-actions">
            <Link to="/report/lost" className="btn primary"><PackageSearch size={18}/> Report Lost</Link>
            <Link to="/report/found" className="btn secondary"><HeartHandshake size={18}/> Report Found</Link>
          </div>
        </div>
        <div className="hero-card">
          <div className="hero-card-top"><span className="live-dot"></span> Campus activity</div>
          <div className="mini-stat"><strong>{stats.lost + stats.found}</strong><span>items reported</span></div>
          <div className="mini-match"><CheckCircle2 size={20}/><div><b>Smart matching</b><small>Finds similar lost & found reports</small></div></div>
          <div className="mini-match"><ShieldCheck size={20}/><div><b>Verified claims</b><small>Private details stay protected</small></div></div>
        </div>
      </section>

      <section className="stats-grid">
        <Stat icon={<PackageSearch/>} number={stats.lost} label="Lost Items"/>
        <Stat icon={<HeartHandshake/>} number={stats.found} label="Found Items"/>
        <Stat icon={<Sparkles/>} number={stats.matches} label="Possible Matches"/>
        <Stat icon={<CheckCircle2/>} number={stats.returned} label="Items Returned"/>
      </section>

      <section className="section">
        <SectionHead title="Recently reported" link="/browse"/>
        <div className="item-grid">
          {[...data.lostItems.map(x=>({...x,type:"lost"})), ...data.foundItems.map(x=>({...x,type:"found"}))]
            .sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt)).slice(0,6)
            .map(item => <ItemCard key={item.id} item={item}/>)}
        </div>
      </section>
    </>
  );
}

function Stat({icon,number,label}) {
  return <div className="stat-card"><div className="stat-icon">{icon}</div><div><strong>{number}</strong><span>{label}</span></div></div>;
}
function SectionHead({title,link}) {
  return <div className="section-head"><h2>{title}</h2>{link && <Link to={link}>View all <ChevronRight size={16}/></Link>}</div>;
}

function ItemCard({item}) {
  return (
    <Link to={`/item/${item.type}/${item.id}`} className="item-card">
      <div className="item-image">{item.image ? <img src={item.image} alt={item.name}/> : <PackageSearch size={32}/>}</div>
      <div className="item-body">
        <div className="card-row"><span className={`badge ${item.type}`}>{item.type}</span><span className="date">{item.date}</span></div>
        <h3>{item.name}</h3>
        <p>{item.description}</p>
        <div className="location"><MapPin size={14}/>{item.location}</div>
      </div>
    </Link>
  );
}

function BrowsePage({data}) {
  const [q,setQ]=useState("");
  const [type,setType]=useState("all");
  const [category,setCategory]=useState("all");
  const [location,setLocation]=useState("all");
  const items = useMemo(() => {
    let all = [
      ...data.lostItems.map(x=>({...x,type:"lost"})),
      ...data.foundItems.map(x=>({...x,type:"found"}))
    ];
    return all.filter(x => {
      const text = `${x.name} ${x.brand} ${x.colour} ${x.description}`.toLowerCase();
      return (!q || text.includes(q.toLowerCase()))
        && (type==="all" || x.type===type)
        && (category==="all" || x.category===category)
        && (location==="all" || x.location===location);
    });
  },[data,q,type,category,location]);
  return <div className="page">
    <div className="page-title"><div><span className="eyebrow">Campus reports</span><h1>Browse items</h1><p>Search through recent lost and found reports.</p></div></div>
    <div className="filters">
      <div className="search-box"><Search size={18}/><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search item, brand, colour..."/></div>
      <select value={type} onChange={e=>setType(e.target.value)}><option value="all">Lost & Found</option><option value="lost">Lost</option><option value="found">Found</option></select>
      <select value={category} onChange={e=>setCategory(e.target.value)}><option value="all">All categories</option>{data.categories.map(c=><option key={c}>{c}</option>)}</select>
      <select value={location} onChange={e=>setLocation(e.target.value)}><option value="all">All locations</option>{data.locations.map(l=><option key={l}>{l}</option>)}</select>
    </div>
    <div className="results-line">{items.length} result{items.length!==1?"s":""}</div>
    <div className="item-grid">{items.map(x=><ItemCard key={`${x.type}-${x.id}`} item={x}/>)}</div>
    {!items.length && <Empty title="No items found" text="Try changing your search or filters."/>}
  </div>;
}

function LoginPage({login,data}) {
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [error,setError]=useState("");
  const navigate=useNavigate();
  const submit=e=>{
    e.preventDefault();
    const account=data.users.find(u=>u.email.toLowerCase()===email.toLowerCase() && u.password===password);
    if(!account) return setError("Email or password is incorrect.");
    login(account); navigate(account.role==="admin"?"/admin":"/dashboard");
  };
  return <AuthShell title="Welcome back" text="Login to manage your campus reports.">
    <form className="form" onSubmit={submit}>
      {error && <div className="error">{error}</div>}
      <Field label="College email"><input type="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="student@college.edu"/></Field>
      <Field label="Password"><input type="password" required value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••"/></Field>
      <button className="btn primary full">Login <LogIn size={17}/></button>
      <p className="form-note">Demo student: <b>student@college.edu</b> / <b>student123</b><br/>Admin: <b>admin@college.edu</b> / <b>admin123</b></p>
      <p className="switch">New here? <Link to="/signup">Create an account</Link></p>
    </form>
  </AuthShell>;
}

function SignupPage({login,data,updateData}) {
  const [form,setForm]=useState({name:"",email:"",password:"",studentId:""});
  const [error,setError]=useState("");
  const navigate=useNavigate();
  const change=e=>setForm({...form,[e.target.name]:e.target.value});
  const submit=e=>{
    e.preventDefault();
    if(form.password.length<6) return setError("Password should contain at least 6 characters.");
    if(data.users.some(u=>u.email.toLowerCase()===form.email.toLowerCase())) return setError("This email is already registered.");
    const user={id:makeId("U"),...form,role:"student"};
    updateData({users:[...data.users,user]}); login(user); navigate("/dashboard");
  };
  return <AuthShell title="Create student account" text="Use your college details to get started.">
    <form className="form" onSubmit={submit}>
      {error && <div className="error">{error}</div>}
      <Field label="Full name"><input name="name" required value={form.name} onChange={change}/></Field>
      <Field label="College email"><input name="email" type="email" required value={form.email} onChange={change}/></Field>
      <div className="form-two"><Field label="Student ID"><input name="studentId" required value={form.studentId} onChange={change}/></Field><Field label="Password"><input name="password" type="password" required value={form.password} onChange={change}/></Field></div>
      <button className="btn primary full">Create account <UserPlus size={17}/></button>
    </form>
  </AuthShell>;
}
function AuthShell({title,text,children}) {
  return <div className="auth-page"><div className="auth-box"><div className="auth-logo"><PackageSearch/></div><h1>{title}</h1><p>{text}</p>{children}</div></div>;
}

function Field({label,children}) { return <label className="field"><span>{label}</span>{children}</label>; }

function ReportPage({type,user,data,updateData}) {
  const initial={name:"",category:data.categories[0],image:"",colour:"",brand:"",description:"",date:new Date().toISOString().slice(0,10),time:"",location:data.locations[0],uniqueDetails:"",remarks:""};
  const [form,setForm]=useState(initial); const [message,setMessage]=useState("");
  const navigate=useNavigate();
  const change=e=>setForm({...form,[e.target.name]:e.target.value});
  const submit=e=>{
    e.preventDefault();
    const id=makeId(type==="lost"?"L":"F");
    const item={...form,id,reporterId:user.id,status:type==="lost"?"Lost":"Found",createdAt:new Date().toISOString()};
    if(type==="lost") {
      const newMatches=data.foundItems.map(found=>({lost:item,found})).map(x=>({...calculateMatch(x.lost,x.found),lostId:item.id,foundId:x.found.id,id:makeId("M")})).filter(x=>x.score>=55);
      updateData({lostItems:[item,...data.lostItems],matches:[...newMatches,...data.matches],
        notifications:[{id:makeId("N"),userId:user.id,text:newMatches.length?`Possible match found for ${item.name}.`:"Your lost item report was created.",createdAt:new Date().toISOString(),read:false},...data.notifications]});
    } else {
      const newMatches=data.lostItems.map(lost=>({lost,found:item})).map(x=>({...calculateMatch(x.lost,x.found),lostId:x.lost.id,foundId:item.id,id:makeId("M")})).filter(x=>x.score>=55);
      const ownerIds=[...new Set(newMatches.map(m=>data.lostItems.find(l=>l.id===m.lostId)?.reporterId).filter(Boolean))];
      const notes=ownerIds.map(uid=>({id:makeId("N"),userId:uid,text:`A possible match was found for your lost item.`,createdAt:new Date().toISOString(),read:false}));
      updateData({foundItems:[item,...data.foundItems],matches:[...newMatches,...data.matches],notifications:[...notes,...data.notifications]});
    }
    setMessage(`${type==="lost"?"Lost":"Found"} item reported successfully. ID: ${id}`);
    setTimeout(()=>navigate("/dashboard"),700);
  };
  return <div className="page narrow">
    <div className="page-title"><div><span className="eyebrow">{type==="lost"?"Lost report":"Found report"}</span><h1>Report {type} item</h1><p>Give enough detail to help the right person identify it.</p></div></div>
    {message && <div className="success">{message}</div>}
    <form className="form report-form" onSubmit={submit}>
      <div className="form-two"><Field label="Item name"><input name="name" required value={form.name} onChange={change} placeholder="e.g. Black wallet"/></Field><Field label="Category"><select name="category" value={form.category} onChange={change}>{data.categories.map(c=><option key={c}>{c}</option>)}</select></Field></div>
      <div className="form-three"><Field label="Colour"><input name="colour" required value={form.colour} onChange={change}/></Field><Field label="Brand"><input name="brand" value={form.brand} onChange={change}/></Field><Field label="Photo URL (optional)"><input name="image" value={form.image} onChange={change} placeholder="https://..."/></Field></div>
      <Field label="Description"><textarea name="description" required rows="4" value={form.description} onChange={change} placeholder="Describe the item and anything useful for identification."/></Field>
      <div className="form-three"><Field label={type==="lost"?"Lost date":"Found date"}><input name="date" type="date" required value={form.date} onChange={change}/></Field><Field label={type==="lost"?"Approx. time":"Found time"}><input name="time" type="time" value={form.time} onChange={change}/></Field><Field label={type==="lost"?"Lost location":"Found location"}><select name="location" value={form.location} onChange={change}>{data.locations.map(l=><option key={l}>{l}</option>)}</select></Field></div>
      {type==="lost" && <Field label="Unique identification details"><textarea name="uniqueDetails" rows="3" value={form.uniqueDetails} onChange={change} placeholder="Private details that can help verify ownership."/></Field>}
      <Field label="Additional remarks"><textarea name="remarks" rows="3" value={form.remarks} onChange={change}/></Field>
      <button className="btn primary">Submit report <Plus size={18}/></button>
    </form>
  </div>;
}

function MatchesPage({data}) {
  const matches=[...data.matches].sort((a,b)=>b.score-a.score);
  return <div className="page">
    <div className="page-title"><div><span className="eyebrow">Smart matching</span><h1>Possible matches</h1><p>These suggestions are based on explainable item similarities.</p></div></div>
    <div className="match-list">{matches.map(m=>{
      const lost=data.lostItems.find(x=>x.id===m.lostId), found=data.foundItems.find(x=>x.id===m.foundId);
      if(!lost||!found) return null;
      return <div className="match-card" key={m.id}>
        <div className="match-items"><div><span className="badge lost">Lost</span><b>{lost.name}</b><small>{lost.location} · {lost.date}</small></div><div className="match-arrow">→</div><div><span className="badge found">Found</span><b>{found.name}</b><small>{found.location} · {found.date}</small></div></div>
        <div className="score"><strong>{m.score}%</strong><span>possible match</span></div>
        <div className="factors">{m.factors.map((f,i)=><span key={i}>{f.ok?"✓":"•"} {f.label}</span>)}</div>
        <Link className="btn small" to={`/item/found/${found.id}`}>View found item</Link>
      </div>;
    })}</div>
    {!matches.length && <Empty title="No matches yet" text="New reports will be compared automatically."/>}
  </div>;
}

function ItemPage({data,user,updateData}) {
  const {type,id}=useParams();
  const item=(type==="lost"?data.lostItems:data.foundItems).find(x=>x.id===id);
  const [claiming,setClaiming]=useState(false);
  const [claimText,setClaimText]=useState("");
  const [sent,setSent]=useState(false);
  if(!item) return <NotFound/>;
  const matches=data.matches.filter(m=>m.lostId===id||m.foundId===id);
  const canClaim=user && type==="found" && item.reporterId!==user.id && item.status!=="Returned";
  const submitClaim=e=>{
    e.preventDefault();
    const claim={id:makeId("C"),foundId:item.id,lostId:matches.find(m=>m.foundId===item.id)?.lostId||"",userId:user.id,details:claimText,status:"Pending",createdAt:new Date().toISOString()};
    updateData({claims:[claim,...data.claims],notifications:[{id:makeId("N"),userId:user.id,text:`Your claim for ${item.name} is under review.`,createdAt:new Date().toISOString(),read:false},...data.notifications]});
    setSent(true);setClaiming(false);
  };
  return <div className="page">
    <Link to="/browse" className="back">← Back to browse</Link>
    <div className="details">
      <div className="detail-image">{item.image?<img src={item.image} alt={item.name}/>:<PackageSearch size={60}/>}</div>
      <div className="detail-content">
        <div className="card-row"><span className={`badge ${type}`}>{type}</span><span>{item.id}</span></div>
        <h1>{item.name}</h1>
        <p className="lead">{item.description}</p>
        <div className="detail-grid"><Info label="Category" value={item.category}/><Info label="Colour" value={item.colour}/><Info label="Brand" value={item.brand||"Not provided"}/><Info label="Location" value={item.location}/><Info label="Date" value={item.date}/><Info label="Time" value={item.time||"Not provided"}/></div>
        <div className="status-line"><span className={`status ${item.status.toLowerCase().replaceAll(" ","-")}`}>{item.status}</span></div>
        {canClaim && !sent && <button className="btn primary" onClick={()=>setClaiming(true)}>Claim Item</button>}
        {sent && <div className="success">Claim submitted. The admin will review your details.</div>}
        {claiming && <form className="claim-box form" onSubmit={submitClaim}><h3>Ownership verification</h3><Field label="How can you identify this item?"><textarea required rows="5" value={claimText} onChange={e=>setClaimText(e.target.value)} placeholder="Mention a private identifying detail that was not posted publicly."/></Field><button className="btn primary">Submit claim</button></form>}
        <div className="match-summary"><h3>Possible matches</h3>{matches.map(m=><div key={m.id} className="tiny-match"><b>{m.score}%</b><span>{m.factors.filter(f=>f.ok).map(f=>f.label).join(" · ")}</span></div>)}{!matches.length&&<p>No possible matches linked yet.</p>}</div>
      </div>
    </div>
  </div>;
}
function Info({label,value}) {return <div><span>{label}</span><b>{value}</b></div>;}

function Dashboard({data,user,updateData}) {
  const lost=data.lostItems.filter(x=>x.reporterId===user.id), found=data.foundItems.filter(x=>x.reporterId===user.id);
  const claims=data.claims.filter(x=>x.userId===user.id);
  const notes=data.notifications.filter(x=>x.userId===user.id);
  const sightings=data.sightings.filter(x=>lost.some(l=>l.id===x.lostId));
  return <div className="page">
    <div className="dash-head"><div><span className="eyebrow">Student dashboard</span><h1>Hi, {user.name.split(" ")[0]} 👋</h1><p>Manage your reports, claims and notifications.</p></div><div className="avatar"><CircleUserRound/></div></div>
    <div className="stats-grid compact"><Stat icon={<PackageSearch/>} number={lost.length} label="My lost reports"/><Stat icon={<HeartHandshake/>} number={found.length} label="My found reports"/><Stat icon={<FileSearch/>} number={claims.length} label="My claims"/><Stat icon={<Bell/>} number={notes.filter(n=>!n.read).length} label="Unread alerts"/></div>
    <div className="dashboard-columns">
      <div className="panel"><SectionHead title="My lost items"/>{lost.length?lost.map(x=><DashboardItem key={x.id} item={x} type="lost"/>):<Empty title="No lost reports" text="Report a lost item when needed." link="/report/lost"/>}</div>
      <div className="panel"><SectionHead title="My found items"/>{found.length?found.map(x=><DashboardItem key={x.id} item={x} type="found"/>):<Empty title="No found reports" text="Report an item you found." link="/report/found"/>}</div>
    </div>
    <div className="panel"><SectionHead title="Notifications"/>{notes.length?notes.slice(0,8).map(n=><div className="notification" key={n.id}><Bell size={17}/><div><b>{n.text}</b><small>{new Date(n.createdAt).toLocaleString()}</small></div></div>):<Empty title="All clear" text="You have no notifications."/ >}</div>
    <div className="panel"><SectionHead title="Help find my item — sightings"/>{sightings.length?sightings.map(s=><div className="sighting" key={s.id}><MapPin size={17}/><div><b>{s.location}</b><p>{s.description}</p><small>{s.date} {s.time}</small></div></div>):<p className="muted">No sightings have been reported for your lost items.</p>}</div>
  </div>;
}
function DashboardItem({item,type}) {return <Link to={`/item/${type}/${item.id}`} className="dash-item"><div><span className={`badge ${type}`}>{type}</span><b>{item.name}</b><small>{item.location} · {item.date}</small></div><span className={`status ${item.status.toLowerCase().replaceAll(" ","-")}`}>{item.status}</span></Link>}

function AdminPage({data,updateData}) {
  const [tab,setTab]=useState("claims");
  const pending=data.claims.filter(c=>c.status==="Pending");
  const approve=(claim,ok)=>{
    const status=ok?"Approved":"Rejected";
    const found=data.foundItems.map(f=>f.id===claim.foundId?{...f,status:ok?"Returned":f.status}:f);
    const notes=[{id:makeId("N"),userId:claim.userId,text:`Your claim has been ${status.toLowerCase()}.`,createdAt:new Date().toISOString(),read:false},...data.notifications];
    updateData({claims:data.claims.map(c=>c.id===claim.id?{...c,status}:c),foundItems:found,notifications:notes});
  };
  return <div className="page">
    <div className="dash-head"><div><span className="eyebrow">Administration</span><h1>Control centre</h1><p>Review reports and verify ownership claims.</p></div><ShieldCheck className="admin-icon"/></div>
    <div className="admin-stats"><Stat icon={<PackageSearch/>} number={data.lostItems.length} label="Lost"/><Stat icon={<HeartHandshake/>} number={data.foundItems.length} label="Found"/><Stat icon={<FileSearch/>} number={pending.length} label="Pending claims"/><Stat icon={<CheckCircle2/>} number={data.foundItems.filter(x=>x.status==="Returned").length} label="Returned"/></div>
    <div className="tabs"><button className={tab==="claims"?"active":""} onClick={()=>setTab("claims")}>Claims</button><button className={tab==="reports"?"active":""} onClick={()=>setTab("reports")}>Reports</button><button className={tab==="users"?"active":""} onClick={()=>setTab("users")}>Users</button></div>
    {tab==="claims" && <div className="panel">{data.claims.map(c=>{const f=data.foundItems.find(x=>x.id===c.foundId),u=data.users.find(x=>x.id===c.userId);return <div className="claim-row" key={c.id}><div><b>{f?.name||"Unknown item"}</b><small>{u?.name} · {u?.email}</small><p>{c.details}</p></div><span className={`status ${c.status.toLowerCase()}`}>{c.status}</span>{c.status==="Pending"&&<div className="claim-actions"><button onClick={()=>approve(c,true)} className="btn small primary">Approve</button><button onClick={()=>approve(c,false)} className="btn small danger">Reject</button></div>}</div>})}</div>}
    {tab==="reports" && <div className="panel"><h3>Recent reports</h3>{[...data.lostItems.map(x=>({...x,type:"Lost"})),...data.foundItems.map(x=>({...x,type:"Found"}))].slice(0,12).map(x=><div className="admin-line" key={x.id}><span className={`badge ${x.type.toLowerCase()}`}>{x.type}</span><b>{x.name}</b><span>{x.location}</span><span>{x.id}</span></div>)}</div>}
    {tab==="users" && <div className="panel"><h3>Registered users</h3>{data.users.map(u=><div className="admin-line" key={u.id}><CircleUserRound size={17}/><b>{u.name}</b><span>{u.email}</span><span>{u.role}</span></div>)}</div>}
  </div>;
}

function Empty({title,text,link}) {return <div className="empty"><div className="empty-icon"><PackageSearch/></div><h3>{title}</h3><p>{text}</p>{link&&<Link className="btn small" to={link}>Create report</Link>}</div>}
function NotFound(){return <div className="page center"><h1>Page not found</h1><Link className="btn primary" to="/">Go home</Link></div>}

export default App;