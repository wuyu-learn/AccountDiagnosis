/* 收益日历 demo 数据渲染 */
(function(){
  var cal=document.getElementById('acc07cal');
  if(cal){
    function fmt(v){ if(v===null)return ''; if(v===0)return '0'; var s=v>0?'+':'−'; var a=Math.abs(v); if(a>=10000)return s+(a/10000).toFixed(1)+'万'; return s+a; }
    var cells=[{d:1,v:520},{d:2,v:-340},{d:3,v:880},{d:4,v:210},{d:5,v:-120},{d:6,v:6},{d:7,v:6},{d:8,v:1320},{d:9,v:640},{d:10,v:-760},{d:11,v:430},{d:12,v:1180},{d:13,v:6},{d:14,v:6},{d:15,v:-420},{d:16,v:760},{d:17,v:1840,sel:true},{d:18,v:380},{d:19,v:-428},{d:20,v:6},{d:21,v:6},{d:22,v:560},{d:23,v:1240},{d:24,v:320},{d:25,v:-210},{d:26,v:690},{d:27,v:6},{d:28,v:6},{d:29,v:840},{d:30,v:280},{e:1},{e:1},{e:1},{e:1},{e:1}];
    cells.forEach(function(c){
      var cell=document.createElement('div');
      if(c.e){ cell.style.height='32px'; cal.appendChild(cell); return; }
      var bg,fg,bd='';
      if(c.v===null||c.v===0){ bg='#F2F3F5'; fg='#B8BCC2'; }
      else if(c.v>0){ bg='#FDE9EA'; fg='#D9342C'; }
      else { bg='#E6F5EE'; fg='#1A9D6E'; }
      if(c.sel) bd='box-shadow:0 0 0 2px #FB5C5F;';
      cell.style.cssText='height:32px;border-radius:5px;display:flex;flex-direction:column;align-items:center;justify-content:center;background:'+bg+';'+bd;
      cell.innerHTML='<div style="font-size:9px;color:#999;line-height:1;">'+c.d+'</div><div style="font-size:9px;font-weight:700;font-family:DIN Alternate,sans-serif;line-height:1.3;color:'+fg+';">'+fmt(c.v)+'</div>';
      cal.appendChild(cell);
    });
  }
  var mcal=document.getElementById('acc07mcal');
  if(mcal){
    function fmt2(v){ if(v===null)return '—'; var s=v>0?'+':'−'; var a=Math.abs(v); if(a>=10000)return s+(a/10000).toFixed(1)+'万'; return s+a; }
    var months=[{m:'1月',v:8200},{m:'2月',v:-15200},{m:'3月',v:23400},{m:'4月',v:-9800},{m:'5月',v:22140},{m:'6月',v:9860,sel:true},{m:'7月',v:null},{m:'8月',v:null},{m:'9月',v:null},{m:'10月',v:null},{m:'11月',v:null},{m:'12月',v:null}];
    months.forEach(function(c){
      var cell=document.createElement('div'); var bg,fg,bd='';
      if(c.v===null){ bg='#F7F8F9'; fg='#C8CBD0'; }
      else if(c.v>0){ bg='#FDE9EA'; fg='#D9342C'; }
      else { bg='#E6F5EE'; fg='#1A9D6E'; }
      if(c.sel) bd='box-shadow:0 0 0 2px #FB5C5F;';
      cell.style.cssText='height:50px;border-radius:7px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;background:'+bg+';'+bd;
      cell.innerHTML='<div style="font-size:11px;color:#888;">'+c.m+'</div><div style="font-size:12px;font-weight:700;font-family:DIN Alternate,sans-serif;color:'+fg+';">'+fmt2(c.v)+'</div>';
      mcal.appendChild(cell);
    });
  }
  var ycal=document.getElementById('acc07ycal');
  if(ycal){
    function fmt3(v){ if(v===null)return '—'; if(v===0)return '0.00'; var s=v>0?'+':'−'; var a=Math.abs(v); if(a>=10000)return s+(a/10000).toFixed(1)+'万'; return s+a; }
    var years=[{y:'2020',v:5558},{y:'2021',v:-16918},{y:'2022',v:-6725},{y:'2023',v:-69},{y:'2024',v:117},{y:'2025',v:352},{y:'2026',v:45600,sel:true}];
    years.forEach(function(c){
      var cell=document.createElement('div'); var bg,fg,bd='';
      if(c.v===null){ bg='#F7F8F9'; fg='#C8CBD0'; }
      else if(c.v>0){ bg='#FDE9EA'; fg='#D9342C'; }
      else { bg='#E6F5EE'; fg='#1A9D6E'; }
      if(c.sel) bd='box-shadow:0 0 0 2px #FB5C5F;';
      cell.style.cssText='height:50px;border-radius:7px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;background:'+bg+';'+bd;
      cell.innerHTML='<div style="font-size:11px;color:#888;">'+c.y+'年</div><div style="font-size:12px;font-weight:700;font-family:DIN Alternate,sans-serif;color:'+fg+';">'+fmt3(c.v)+'</div>';
      ycal.appendChild(cell);
    });
  }
})();
