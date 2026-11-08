// V24 MEGA Views - Upload, Live, Permanent
// Upload Views
firebase.database().ref("videos/"+videoId+"/views").set(1);
// Live Views - PeerJS bellal.surge.sh
peer.on("connection",()=>{ liveViews++ });
// Permanent Views
firebase.database().ref("videos/"+videoId+"/views").transaction(v=>v+1); 
