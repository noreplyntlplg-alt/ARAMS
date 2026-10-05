/* ARAMS Code.gs - Complete Google Apps Script API */
const CONFIG={
  SPREADSHEET_ID:'1ebtVEnf95sZ6n04SsccZXKAgkoz6o0ZRzKwWdKuInk0',
  SYSTEM_NAME:'Academic Registration and Assessment Management System (ARAMS)',
  SCHOOL_NAME:'ระบบบริหารงานทะเบียนและวัดผล ARAMS',
  ADMIN_USERNAME:'sxaiq54',
  ADMIN_PASSWORD:'Sxxnga2011',
  SESSION_PREFIX:'ARAMS_SESSION_',SESSION_SECONDS:21600,
  TZ:Session.getScriptTimeZone()||'Asia/Bangkok',PAGE_SIZE:100,
  SHEETS:{
    Settings:'Settings',Users:'Users',Students:'Students',Parents:'Parents',Teachers:'Teachers',Classes:'Classes',Subjects:'Subjects',Curriculum:'Curriculum',Teaching:'Teaching',Scores:'Scores',Grades:'Grades',Attendance:'Attendance',LeaveRequests:'LeaveRequests',Remedial:'Remedial',Documents:'Documents',Announcements:'Announcements',Notifications:'Notifications',AuditLogs:'AuditLogs',AcademicYears:'AcademicYears',Terms:'Terms',GradeRules:'GradeRules',AttendanceRules:'AttendanceRules'
  }
};
const SCHEMA={
  Settings:['settingId','schoolName','address','phone','website','logoUrl','schoolSealUrl','currentAcademicYear','currentTerm','principalName','registrarName','principalSignatureUrl','registrarSignatureUrl','teacherSignatureUrl','documentPrefix','nextDocumentNumber','createdAt','updatedAt'],
  Users:['userId','username','passwordHash','passwordSalt','role','displayName','email','phone','studentId','teacherId','parentId','classId','status','lastLoginAt','createdAt','updatedAt'],
  Students:['studentId','studentNumber','nationalId','title','firstName','lastName','birthDate','gender','classId','academicYear','photoUrl','address','phone','parentId','status','enrollmentDate','graduationDate','exitDate','exitReason','notes','createdAt','updatedAt'],
  Parents:['parentId','parentCode','title','firstName','lastName','relationship','nationalId','phone','email','address','lineId','username','status','createdAt','updatedAt'],
  Teachers:['teacherId','teacherCode','title','firstName','lastName','nationalId','department','position','phone','email','photoUrl','status','createdAt','updatedAt'],
  Classes:['classId','academicYear','level','room','className','homeroomTeacherId','capacity','status','createdAt','updatedAt'],
  Subjects:['subjectId','subjectCode','subjectName','learningArea','subjectType','credits','hoursPerWeek','hoursPerTerm','levels','status','description','createdAt','updatedAt'],
  Curriculum:['curriculumId','academicYear','level','learningArea','subjectId','subjectType','credits','hours','activityType','status','createdAt','updatedAt'],
  Teaching:['teachingId','academicYear','term','teacherId','subjectId','classId','level','room','period','dayOfWeek','startTime','endTime','status','createdAt','updatedAt'],
  Scores:['scoreId','academicYear','term','teachingId','studentId','studentNumber','subjectId','classId','workScore','midtermScore','finalScore','totalScore','percentage','grade','gradeStatus','abnormalReason','teacherNote','isSubmitted','submittedBy','submittedAt','createdAt','updatedAt'],
  Grades:['gradeId','academicYear','term','studentId','subjectId','classId','teachingId','credits','totalScore','grade','gradePoint','status','remarks','createdAt','updatedAt'],
  Attendance:['attendanceId','academicYear','term','date','period','teachingId','studentId','studentNumber','classId','subjectId','status','checkInTime','minutes','note','recordedBy','createdAt','updatedAt'],
  LeaveRequests:['leaveId','requestNumber','studentId','parentId','leaveType','startDate','endDate','days','reason','attachmentUrl','homeroomTeacherId','subjectTeacherId','academicAffairsId','approvedBy','approvedAt','status','approvalNote','createdAt','updatedAt'],
  Remedial:['remedialId','remedialNumber','academicYear','term','studentId','subjectId','classId','teacherId','originalGrade','reasonType','reason','assignedDate','dueDate','task','beforeScore','afterScore','afterGrade','actionDate','note','status','createdAt','updatedAt'],
  Documents:['documentId','documentNumber','documentType','studentId','academicYear','term','requestedBy','issuedBy','issueDate','fileUrl','status','notes','createdAt','updatedAt'],
  Announcements:['announcementId','title','content','audience','academicYear','term','publishStart','publishEnd','priority','attachmentUrl','createdBy','status','createdAt','updatedAt'],
  Notifications:['notificationId','userId','studentId','type','title','message','referenceType','referenceId','isRead','createdAt','readAt'],
  AuditLogs:['logId','userId','username','role','action','entity','entityId','method','payloadSummary','ip','createdAt'],
  AcademicYears:['academicYearId','academicYear','name','startDate','endDate','status','createdAt','updatedAt'],
  Terms:['termId','academicYear','term','name','startDate','endDate','status','createdAt','updatedAt'],
  GradeRules:['ruleId','grade','minScore','maxScore','gradePoint','status','createdAt','updatedAt'],
  AttendanceRules:['ruleId','name','minimumPercentage','maximumAbsence','status','createdAt','updatedAt']
};
function doGet(e){
  try{
    return out({
      success:true,system:CONFIG.SYSTEM_NAME,schoolName:schoolName(),timestamp:now(),action:(e&&e.parameter&&e.parameter.action)||'health'
    }
    );
  }catch(err){
    return out(errObj(err));
  }
}
function doPost(e){
  try{
    const p=request(e),a=String(p.action||'').trim();
    if(!a)throw Error('กรุณาระบุ action');
    return out({
      success:true,data:route(a,p)
    }
    );
  }catch(err){
    return out(errObj(err));
  }
}
function route(a,p){
  switch(a){
    case'health':return{
      system:CONFIG.SYSTEM_NAME,schoolName:schoolName(),timestamp:now()
    };
    case'setupSystem':
      return setupSystemWeb_(p);
    case'getSettings':loginRequired(p);
    return getSettings();
    case'saveSettings':role(p,['ADMIN','PRINCIPAL','ACADEMIC_AFFAIRS']);
    return saveSettings(p);
    case'login':return login(p);
    case'logout':return logout(p);
    case'me':return{
      user:publicUser(loginRequired(p))
    };
    case'changePassword':return changePassword(p);
    case'getDashboard':return dashboard(p);
    case'getAnalytics':return analytics(p);
    case'getUsers':role(p,['ADMIN']);
    return list('Users',p,true);
    case'saveUser':role(p,['ADMIN']);
    return saveUser(p);
    case'deleteUser':role(p,['ADMIN']);
    return del('Users',p);
    case'getStudents':return students(p);
    case'getStudent':return student(p);
    case'saveStudent':role(p,['ADMIN','ACADEMIC_AFFAIRS','REGISTRAR','HOMEROOM_TEACHER']);
    return saveStudent(p);
    case'deleteStudent':role(p,['ADMIN','ACADEMIC_AFFAIRS','REGISTRAR']);
    return del('Students',p);
    case'changeStudentStatus':role(p,['ADMIN','ACADEMIC_AFFAIRS','REGISTRAR']);
    return studentStatus(p);
    case'getStudentHistory':return history(p);
    case'getParents':role(p,['ADMIN','ACADEMIC_AFFAIRS','REGISTRAR']);
    return list('Parents',p);
    case'saveParent':role(p,['ADMIN','ACADEMIC_AFFAIRS','REGISTRAR']);
    return saveOne('Parents',p.data,p);
    case'deleteParent':role(p,['ADMIN','ACADEMIC_AFFAIRS','REGISTRAR']);
    return del('Parents',p);
    case'getTeachers':loginRequired(p);
    return list('Teachers',p);
    case'saveTeacher':role(p,['ADMIN','ACADEMIC_AFFAIRS']);
    return saveOne('Teachers',p.data,p);
    case'deleteTeacher':role(p,['ADMIN','ACADEMIC_AFFAIRS']);
    return del('Teachers',p);
    case'getClasses':loginRequired(p);
    return list('Classes',p);
    case'saveClass':role(p,['ADMIN','ACADEMIC_AFFAIRS','REGISTRAR']);
    return saveOne('Classes',p.data,p);
    case'deleteClass':role(p,['ADMIN','ACADEMIC_AFFAIRS','REGISTRAR']);
    return del('Classes',p);
    case'assignStudentClass':role(p,['ADMIN','ACADEMIC_AFFAIRS','REGISTRAR']);
    return assignClass(p);
    case'moveStudentClass':role(p,['ADMIN','ACADEMIC_AFFAIRS','REGISTRAR']);
    return assignClass(p);
    case'promoteStudents':role(p,['ADMIN','ACADEMIC_AFFAIRS','REGISTRAR']);
    return promote(p);
    case'getSubjects':loginRequired(p);
    return list('Subjects',p);
    case'saveSubject':role(p,['ADMIN','ACADEMIC_AFFAIRS']);
    return saveOne('Subjects',p.data,p);
    case'deleteSubject':role(p,['ADMIN','ACADEMIC_AFFAIRS']);
    return del('Subjects',p);
    case'getCurriculum':loginRequired(p);
    return list('Curriculum',p);
    case'saveCurriculum':role(p,['ADMIN','ACADEMIC_AFFAIRS']);
    return saveOne('Curriculum',p.data,p);
    case'deleteCurriculum':role(p,['ADMIN','ACADEMIC_AFFAIRS']);
    return del('Curriculum',p);
    case'getTeaching':return teaching(p);
    case'saveTeaching':role(p,['ADMIN','ACADEMIC_AFFAIRS']);
    return saveOne('Teaching',p.data,p);
    case'deleteTeaching':role(p,['ADMIN','ACADEMIC_AFFAIRS']);
    return del('Teaching',p);
    case'getScoreEntries':return scores(p);
    case'saveScores':role(p,['ADMIN','ACADEMIC_AFFAIRS','TEACHER','HOMEROOM_TEACHER']);
    return saveScores(p);
    case'submitScores':role(p,['ADMIN','ACADEMIC_AFFAIRS','TEACHER','HOMEROOM_TEACHER']);
    return submitScores(p);
    case'reopenScores':role(p,['ADMIN','ACADEMIC_AFFAIRS']);
    return reopenScores(p);
    case'calculateGrades':role(p,['ADMIN','ACADEMIC_AFFAIRS','TEACHER','HOMEROOM_TEACHER']);
    return calcGrades(p);
    case'validateScores':role(p,['ADMIN','ACADEMIC_AFFAIRS','TEACHER','HOMEROOM_TEACHER']);
    return validateScores(p);
    case'getGrades':return grades(p);
    case'getStudentGrades':return grades({
      token:p.token,filters:{
        studentId:p.studentId,academicYear:p.academicYear,term:p.term
      }
    }
    );
    case'getGPA':return gpa(p);
    case'getGradeStatistics':role(p,['ADMIN','PRINCIPAL','ACADEMIC_AFFAIRS','TEACHER','HOMEROOM_TEACHER']);
    return gradeStats(p);
    case'getAbnormalGrades':return abnormal(p);
    case'getAttendance':return attendance(p);
    case'saveAttendance':role(p,['ADMIN','ACADEMIC_AFFAIRS','TEACHER','HOMEROOM_TEACHER']);
    return saveAttendance(p);
    case'getAttendanceSummary':return attendanceSummary(p);
    case'getAttendanceReports':role(p,['ADMIN','PRINCIPAL','ACADEMIC_AFFAIRS','TEACHER','HOMEROOM_TEACHER']);
    return attendanceReports(p);
    case'getLeaveRequests':return leaves(p);
    case'saveLeaveRequest':return saveLeave(p);
    case'approveLeave':role(p,['ADMIN','PRINCIPAL','ACADEMIC_AFFAIRS','HOMEROOM_TEACHER']);
    return approveLeave(p,true);
    case'rejectLeave':role(p,['ADMIN','PRINCIPAL','ACADEMIC_AFFAIRS','HOMEROOM_TEACHER']);
    return approveLeave(p,false);
    case'getRemedial':return remedial(p);
    case'saveRemedial':role(p,['ADMIN','ACADEMIC_AFFAIRS','TEACHER','HOMEROOM_TEACHER']);
    return saveRemedial(p);
    case'updateRemedialStatus':role(p,['ADMIN','ACADEMIC_AFFAIRS','TEACHER','HOMEROOM_TEACHER']);
    return updateRemedial(p);
    case'getDocuments':return list('Documents',p);
    case'createDocument':role(p,['ADMIN','PRINCIPAL','ACADEMIC_AFFAIRS','REGISTRAR']);
    return createDocument(p);
    case'getDocumentData':return documentData(p);
    case'getDocumentNumber':loginRequired(p);
    return{
      documentNumber:nextDoc(String(p.prefix||'DOC'))
    };
    case'getAnnouncements':return announcements(p);
    case'saveAnnouncement':role(p,['ADMIN','PRINCIPAL','ACADEMIC_AFFAIRS']);
    return saveAnnouncement(p);
    case'deleteAnnouncement':role(p,['ADMIN','PRINCIPAL','ACADEMIC_AFFAIRS']);
    return del('Announcements',p);
    case'getNotifications':return notifications(p);
    case'markNotificationRead':return markNotification(p);
    case'createNotification':role(p,['ADMIN','PRINCIPAL','ACADEMIC_AFFAIRS']);
    return saveOne('Notifications',p.data,p);
    case'getAcademicReport':role(p,['ADMIN','PRINCIPAL','ACADEMIC_AFFAIRS']);
    return academicReport(p);
    case'getStudentReport':return history(p);
    case'getClassReport':role(p,['ADMIN','PRINCIPAL','ACADEMIC_AFFAIRS','TEACHER','HOMEROOM_TEACHER']);
    return classReport(p);
    case'getSchoolReport':role(p,['ADMIN','PRINCIPAL','ACADEMIC_AFFAIRS']);
    return schoolReport(p);
    case'getAcademicYears':loginRequired(p);
    return list('AcademicYears',p);
    case'saveAcademicYear':role(p,['ADMIN','ACADEMIC_AFFAIRS']);
    return saveOne('AcademicYears',p.data,p);
    case'getTerms':loginRequired(p);
    return list('Terms',p);
    case'saveTerm':role(p,['ADMIN','ACADEMIC_AFFAIRS']);
    return saveOne('Terms',p.data,p);
    case'getGradeRules':loginRequired(p);
    return list('GradeRules',p);
    case'saveGradeRule':role(p,['ADMIN','ACADEMIC_AFFAIRS']);
    return saveOne('GradeRules',p.data,p);
    case'getAttendanceRules':loginRequired(p);
    return list('AttendanceRules',p);
    case'saveAttendanceRule':role(p,['ADMIN','ACADEMIC_AFFAIRS']);
    return saveOne('AttendanceRules',p.data,p);
    case'listRecords':loginRequired(p);
    return list(p.sheet,p,p.hideSensitive);
    case'saveRecord':role(p,['ADMIN','ACADEMIC_AFFAIRS']);
    return saveOne(p.sheet,p.data,p);
    case'deleteRecord':role(p,['ADMIN','ACADEMIC_AFFAIRS']);
    return del(p.sheet,p);
    default:throw Error('ไม่พบ API action: '+a);
  }
}
function setupSystemWeb_(p){
  const users=rows('Users');
  const hasAdmin=users.some(u=>String(u.role)==='ADMIN'&&String(u.status)==='ACTIVE');
  if(hasAdmin) admin(p);
  const result=setupSystem();
  return {message:result.message,sheets:result.sheets,adminUsername:result.adminUsername};
}
function setupSystem(){
  const lock=LockService.getScriptLock();
  lock.waitLock(30000);
  try{
    const ss=db();
    Object.keys(SCHEMA).forEach(n=>ensureSheet(ss,n,SCHEMA[n]));
    if(!rows('Settings').length)append('Settings',{
      settingId:id('SET'),schoolName:CONFIG.SCHOOL_NAME,address:'',phone:'',website:'',logoUrl:'',schoolSealUrl:'',currentAcademicYear:'',currentTerm:'1',principalName:'',registrarName:'',principalSignatureUrl:'',registrarSignatureUrl:'',teacherSignatureUrl:'',documentPrefix:'ARAMS',nextDocumentNumber:1,createdAt:now(),updatedAt:now()
    }
    );
    if(!rows('GradeRules').length){
      [['4',80,100,4],['3.5',75,79.99,3.5],['3',70,74.99,3],['2.5',65,69.99,2.5],['2',60,64.99,2],['1.5',55,59.99,1.5],['1',50,54.99,1],['0',0,49.99,0]].forEach(r=>append('GradeRules',{
        ruleId:id('GR'),grade:r[0],minScore:r[1],maxScore:r[2],gradePoint:r[3],status:'ACTIVE',createdAt:now(),updatedAt:now()
      }
      ));
    }
    if(!rows('AttendanceRules').length)append('AttendanceRules',{
      ruleId:id('AR'),name:'เกณฑ์การมาเรียนขั้นต่ำ',minimumPercentage:80,maximumAbsence:20,status:'ACTIVE',createdAt:now(),updatedAt:now()
    }
    );
    if(!rows('AcademicYears').length)append('AcademicYears',{
      academicYearId:id('AY'),academicYear:'',name:'',startDate:'',endDate:'',status:'ACTIVE',createdAt:now(),updatedAt:now()
    }
    );
    if(!rows('Terms').length){
      append('Terms',{
        termId:id('TERM'),academicYear:'',term:'1',name:'ภาคเรียนที่ 1',startDate:'',endDate:'',status:'ACTIVE',createdAt:now(),updatedAt:now()
      }
      );
      append('Terms',{
        termId:id('TERM'),academicYear:'',term:'2',name:'ภาคเรียนที่ 2',startDate:'',endDate:'',status:'ACTIVE',createdAt:now(),updatedAt:now()
      }
      );
    }
    if(!rows('Users').some(u=>String(u.username).toLowerCase()===CONFIG.ADMIN_USERNAME.toLowerCase())){
      const salt=id('SALT');
      append('Users',{
        userId:id('USR'),username:CONFIG.ADMIN_USERNAME,passwordHash:hash(CONFIG.ADMIN_PASSWORD,salt),passwordSalt:salt,role:'ADMIN',displayName:'ผู้ดูแลระบบ',email:'',phone:'',studentId:'',teacherId:'',parentId:'',classId:'',status:'ACTIVE',lastLoginAt:'',createdAt:now(),updatedAt:now()
      }
      );
    }
    return{
      message:'ติดตั้ง ARAMS สำเร็จ',spreadsheetId:ss.getId(),sheets:Object.keys(SCHEMA),adminUsername:CONFIG.ADMIN_USERNAME
    };
  }finally{
    lock.releaseLock();
  }
}
function ensureSheet(ss,n,h){
  let s=ss.getSheetByName(n);
  if(!s)s=ss.insertSheet(n);
  if(s.getMaxColumns()<h.length)s.insertColumnsAfter(s.getMaxColumns(),h.length-s.getMaxColumns());
  s.getRange(1,1,1,h.length).setValues([h]).setFontWeight('bold').setBackground('#1f2937').setFontColor('#fff');
  s.setFrozenRows(1);
}
function login(p){
  const u=String(p.username||'').trim(),pw=String(p.password||'');
  if(!u||!pw)throw Error('กรุณากรอกชื่อผู้ใช้และรหัสผ่าน');
  const user=rows('Users').find(x=>String(x.username).toLowerCase()===u.toLowerCase());
  if(!user||user.status!=='ACTIVE'||hash(pw,user.passwordSalt)!==user.passwordHash)throw Error('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
  const token=id('TOKEN')+id('TOKEN');
  const sess={
    token:token,userId:user.userId,username:user.username,role:user.role,displayName:user.displayName,studentId:user.studentId,teacherId:user.teacherId,parentId:user.parentId,classId:user.classId,createdAt:now()
  };
  CacheService.getScriptCache().put(CONFIG.SESSION_PREFIX+token,JSON.stringify(sess),CONFIG.SESSION_SECONDS);
  update('Users','userId',user.userId,{
    lastLoginAt:now(),updatedAt:now()
  }
  );
  audit(sess,'LOGIN','Users',user.userId,'login',{
  }
  );
  return{
    token:token,user:publicUser(user)
  };
}
function logout(p){
  const s=getSession(p.token);
  if(p.token)CacheService.getScriptCache().remove(CONFIG.SESSION_PREFIX+p.token);
  if(s)audit(s,'LOGOUT','Users',s.userId,'logout',{
  }
  );
  return{
    loggedOut:true
  };
}
function loginRequired(p){
  const s=getSession(String(p.token||''));
  if(!s)throw Error('กรุณาเข้าสู่ระบบหรือ Session หมดอายุ');
  return s;
}
function admin(p){
  const s=loginRequired(p);
  if(s.role!=='ADMIN')throw Error('เฉพาะผู้ดูแลระบบ');
  return s;
}
function role(p,r){
  const s=loginRequired(p);
  if(r.indexOf(s.role)<0)throw Error('ไม่มีสิทธิ์ดำเนินการ');
  return s;
}
function getSession(t){
  if(!t)return null;
  const x=CacheService.getScriptCache().get(CONFIG.SESSION_PREFIX+t);
  if(!x)return null;
  try{
    return JSON.parse(x)
  }catch(e){
    return null
  }
}
function publicUser(u){
  return{
    userId:u.userId,username:u.username,role:u.role,displayName:u.displayName,email:u.email,phone:u.phone,studentId:u.studentId,teacherId:u.teacherId,parentId:u.parentId,classId:u.classId,status:u.status,lastLoginAt:u.lastLoginAt
  };
}
function changePassword(p){
  const s=loginRequired(p),u=find('Users','userId',s.userId);
  if(!u)throw Error('ไม่พบผู้ใช้');
  if(hash(String(p.oldPassword||''),u.passwordSalt)!==u.passwordHash)throw Error('รหัสผ่านเดิมไม่ถูกต้อง');
  if(String(p.newPassword||'').length<8)throw Error('รหัสผ่านใหม่ต้องมีอย่างน้อย 8 ตัวอักษร');
  const salt=id('SALT');
  update('Users','userId',s.userId,{
    passwordSalt:salt,passwordHash:hash(p.newPassword,salt),updatedAt:now()
  }
  );
  return{
    changed:true
  };
}
function saveUser(p){
  const d=p.data||{
  };
  if(!d.username||!d.role)throw Error('กรุณาระบุ username และ role');
  const dup=rows('Users').find(x=>String(x.username).toLowerCase()===String(d.username).toLowerCase()&&x.userId!==d.userId);
  if(dup)throw Error('Username ซ้ำ');
  if(d.userId){
    const old=find('Users','userId',d.userId);
    if(!old)throw Error('ไม่พบผู้ใช้');
    const u=Object.assign({
    },d,{
      updatedAt:now()
    }
    );
    delete u.password;
    delete u.userId;
    if(d.password){
      const salt=id('SALT');
      u.passwordSalt=salt;
      u.passwordHash=hash(d.password,salt);
    }
    update('Users','userId',d.userId,u);
    return publicUser(find('Users','userId',d.userId));
  }
  if(String(d.password||'').length<8)throw Error('รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร');
  const salt=id('SALT');
  const rec=Object.assign({
  },d,{
    userId:id('USR'),passwordSalt:salt,passwordHash:hash(d.password,salt),status:d.status||'ACTIVE',createdAt:now(),updatedAt:now()
  }
  );
  delete rec.password;
  append('Users',rec);
  return publicUser(rec);
}
function dashboard(p){
  const s=loginRequired(p),f=p.filters||p,year=String(f.academicYear||currentYear()),term=String(f.term||currentTerm());
  let st=rows('Students'),sc=rows('Scores'),att=rows('Attendance');
  if(year)st=st.filter(x=>!x.academicYear||x.academicYear===year);
  if(s.role==='STUDENT')st=st.filter(x=>x.studentId===s.studentId);
  if(s.role==='PARENT')st=st.filter(x=>x.parentId===s.parentId);
  const ids={
  };
  st.forEach(x=>ids[x.studentId]=1);
  sc=sc.filter(x=>(!year||x.academicYear===year)&&(!term||x.term===term)&&ids[x.studentId]);
  const today=todayDate(),ta=att.filter(x=>x.date===today&&ids[x.studentId]);
  const gc={
    '4':0,'3.5':0,'3':0,'2.5':0,'2':0,'1.5':0,'1':0,'0':0,'ร':0,'มส':0,'มผ':0
  };
  sc.forEach(x=>{
    const g=normGrade(x.grade);
    if(gc[g]!==undefined)gc[g]++
  }
  );
  const ac={
    total:ta.length,present:0,absent:0,leave:0,late:0,activity:0,other:0
  };
  ta.forEach(x=>{
    const q=normAtt(x.status);
    if(q==='มา')ac.present++;
    else if(q==='ขาด')ac.absent++;
    else if(q==='ลา')ac.leave++;
    else if(q==='สาย')ac.late++;
    else if(q==='เข้าร่วมกิจกรรม')ac.activity++;
    else ac.other++;
  }
  );
  const pending=rows('Teaching').filter(t=>(!year||t.academicYear===year)&&(!term||t.term===term)&&(s.role!=='TEACHER'||t.teacherId===s.teacherId)).map(t=>{
    const n=st.filter(x=>x.classId===t.classId).length,c=sc.filter(x=>x.teachingId===t.teachingId).length;
    return n>c?{
      type:'SCORE',teachingId:t.teachingId,missing:n-c
    }
    :null
  }
  ).filter(Boolean);
  return{
    academicYear:year,term:term,counts:{
      students:st.length,male:st.filter(x=>gender(x.gender)==='ชาย').length,female:st.filter(x=>gender(x.gender)==='หญิง').length,teachers:rows('Teachers').filter(x=>x.status!=='INACTIVE').length,classes:rows('Classes').filter(x=>!year||x.academicYear===year).length,subjects:rows('Subjects').filter(x=>x.status!=='INACTIVE').length
    },gradeCounts:{
      complete:sc.filter(x=>['1','1.5','2','2.5','3','3.5','4'].indexOf(normGrade(x.grade))>=0).length,zero:gc['0'],R:gc['ร'],MS:gc['มส'],MP:gc['มผ'],remedial:gc['0']+gc['ร']+gc['มส']+gc['มผ']
    },attendanceToday:ac,gradeDistribution:gc,pendingTasks:pending,recentAnnouncements:activeAnnouncements(s.role,10)
  };
}
function analytics(p){
  loginRequired(p);
  const f=p.filters||p;
  let g=rows('Grades'),a=rows('Attendance');
  ['academicYear','term','classId','subjectId'].forEach(k=>{
    if(f[k]){
      g=g.filter(x=>String(x[k])===String(f[k]));
      a=a.filter(x=>String(x[k])===String(f[k]));
    }
  }
  );
  const gp=g.map(x=>numNull(x.gradePoint)).filter(x=>x!==null),avg=gp.length?round(gp.reduce((a,b)=>a+b,0)/gp.length,2):0;
  const pass=g.filter(x=>['0','ร','มส','มผ'].indexOf(normGrade(x.grade))<0).length;
  const present=a.filter(x=>normAtt(x.status)==='มา').length;
  return{
    filters:f,averageGPA:avg,passRate:g.length?round(pass/g.length*100,2):0,gradeDistribution:distribution(g),attendanceRate:a.length?round(present/a.length*100,2):0,attendance:{
      total:a.length,present:present,absent:a.filter(x=>normAtt(x.status)==='ขาด').length,leave:a.filter(x=>normAtt(x.status)==='ลา').length,late:a.filter(x=>normAtt(x.status)==='สาย').length
    }
  };
}
function students(p){
  const s=loginRequired(p),f=p.filters||p;
  let a=rows('Students');
  if(f.search){
    const q=String(f.search).toLowerCase();
    a=a.filter(x=>Object.keys(x).some(k=>String(x[k]||'').toLowerCase().indexOf(q)>=0));
  }
  ['academicYear','classId','status','gender'].forEach(k=>{
    if(f[k])a=a.filter(x=>String(k==='gender'?gender(x[k]):x[k])===String(k==='gender'?gender(f[k]):f[k]));
  }
  );
  if(s.role==='STUDENT')a=a.filter(x=>x.studentId===s.studentId);
  if(s.role==='PARENT')a=a.filter(x=>x.parentId===s.parentId);
  if(s.role==='HOMEROOM_TEACHER'&&s.classId)a=a.filter(x=>x.classId===s.classId);
  return page(a,f);
}
function student(p){
  const s=loginRequired(p),idv=String(p.studentId||'');
  const x=find('Students','studentId',idv);
  if(!x)throw Error('ไม่พบนักเรียน');
  if(s.role==='STUDENT'&&s.studentId!==idv)throw Error('ไม่มีสิทธิ์');
  if(s.role==='PARENT'&&x.parentId!==s.parentId)throw Error('ไม่มีสิทธิ์');
  return x;
}
function saveStudent(p){
  const d=p.data||{
  };
  if(!d.studentNumber||!d.firstName||!d.lastName)throw Error('กรุณากรอกเลขประจำตัว ชื่อ และนามสกุล');
  const dup=rows('Students').find(x=>String(x.studentNumber)===String(d.studentNumber)&&x.studentId!==d.studentId);
  if(dup)throw Error('เลขประจำตัวนักเรียนซ้ำ');
  return saveOne('Students',Object.assign({
  },d,{
    status:d.status||'ACTIVE',enrollmentDate:d.enrollmentDate||todayDate()
  }
  ),p);
}
function studentStatus(p){
  const d={
    status:String(p.status||''),notes:String(p.reason||''),updatedAt:now()
  };
  if(d.status==='GRADUATED')d.graduationDate=todayDate();
  if(['TRANSFERRED','RESIGNED','DISMISSED'].indexOf(d.status)>=0){
    d.exitDate=todayDate();
    d.exitReason=d.notes;
  }
  update('Students','studentId',p.studentId,d);
  return find('Students','studentId',p.studentId);
}
function history(p){
  const s=loginRequired(p),sid=String(p.studentId||(s.role==='STUDENT'?s.studentId:''));
  if(!sid)throw Error('กรุณาระบุ studentId');
  if(s.role==='STUDENT'&&s.studentId!==sid)throw Error('ไม่มีสิทธิ์');
  return{
    student:find('Students','studentId',sid),scores:rows('Scores').filter(x=>x.studentId===sid),grades:rows('Grades').filter(x=>x.studentId===sid),attendance:rows('Attendance').filter(x=>x.studentId===sid),leaves:rows('LeaveRequests').filter(x=>x.studentId===sid),remedial:rows('Remedial').filter(x=>x.studentId===sid)
  };
}
function assignClass(p){
  const sid=String(p.studentId),cid=String(p.classId||p.toClassId||'');
  if(!find('Students','studentId',sid)||!find('Classes','classId',cid))throw Error('ไม่พบข้อมูลนักเรียนหรือห้อง');
  update('Students','studentId',sid,{
    classId:cid,academicYear:String(p.academicYear||currentYear()),updatedAt:now()
  }
  );
  return find('Students','studentId',sid);
}
function promote(p){
  const a=rows('Students').filter(x=>x.classId===String(p.fromClassId));
  a.forEach(x=>update('Students','studentId',x.studentId,{
    classId:String(p.toClassId),academicYear:String(p.academicYear||currentYear()),updatedAt:now()
  }
  ));
  return{
    count:a.length
  };
}
function teaching(p){
  const s=loginRequired(p),f=p.filters||p;
  let a=rows('Teaching');
  ['academicYear','term','teacherId','classId','subjectId'].forEach(k=>{
    if(f[k])a=a.filter(x=>String(x[k])===String(f[k]));
  }
  );
  if(['TEACHER','HOMEROOM_TEACHER'].indexOf(s.role)>=0)a=a.filter(x=>x.teacherId===s.teacherId);
  return page(a,f);
}
function scores(p){
  const s=loginRequired(p),f=p.filters||p;
  let a=rows('Scores');
  ['academicYear','term','teachingId','classId','subjectId','studentId'].forEach(k=>{
    if(f[k])a=a.filter(x=>String(x[k])===String(f[k]));
  }
  );
  if(s.role==='STUDENT')a=a.filter(x=>x.studentId===s.studentId);
  if(s.role==='PARENT'){
    const ids=rows('Students').filter(x=>x.parentId===s.parentId).map(x=>x.studentId);
    a=a.filter(x=>ids.indexOf(x.studentId)>=0);
  }
  if(['TEACHER','HOMEROOM_TEACHER'].indexOf(s.role)>=0){
    const tids=rows('Teaching').filter(x=>x.teacherId===s.teacherId).map(x=>x.teachingId);
    a=a.filter(x=>tids.indexOf(x.teachingId)>=0);
  }
  return{
    data:page(a,f),students:rows('Students').filter(x=>a.some(y=>y.studentId===x.studentId)),teaching:rows('Teaching').filter(x=>a.some(y=>y.teachingId===x.teachingId))
  };
}
function saveScores(p){
  const s=loginRequired(p),list=p.entries||p.data;
  if(!Array.isArray(list))throw Error('entries ต้องเป็น Array');
  const out=[];
  list.forEach(e=>{
    const t=find('Teaching','teachingId',e.teachingId);
    if(!t)throw Error('ไม่พบตารางสอน');
    if(['TEACHER','HOMEROOM_TEACHER'].indexOf(s.role)>=0&&t.teacherId!==s.teacherId)throw Error('ไม่มีสิทธิ์บันทึกวิชานี้');
    ['workScore','midtermScore','finalScore'].forEach(k=>{
      if(e[k]!==''&&e[k]!==undefined&&isNaN(Number(e[k])))throw Error(k+' ต้องเป็นตัวเลข');
    }
    );
    const total=round(num(e.workScore)+num(e.midtermScore)+num(e.finalScore),2);
    if(total>100)throw Error('คะแนนรวมเกิน 100');
    const g=['ร','มส','มผ'].indexOf(normGrade(e.gradeStatus))>=0?normGrade(e.gradeStatus):grade(total);
    const d={
      academicYear:t.academicYear,term:t.term,teachingId:t.teachingId,studentId:String(e.studentId),studentNumber:String(e.studentNumber||''),subjectId:t.subjectId,classId:t.classId,workScore:num(e.workScore),midtermScore:num(e.midtermScore),finalScore:num(e.finalScore),totalScore:total,percentage:total,grade:g,gradeStatus:['0','ร','มส','มผ'].indexOf(g)>=0?'ABNORMAL':'NORMAL',abnormalReason:String(e.abnormalReason||''),teacherNote:String(e.teacherNote||''),updatedAt:now()
    };
    const old=rows('Scores').find(x=>x.studentId===d.studentId&&x.teachingId===d.teachingId);
    if(old)update('Scores','scoreId',old.scoreId,d);
    else{
      d.scoreId=id('SCORE');
      d.isSubmitted=false;
      d.submittedBy='';
      d.submittedAt='';
      d.createdAt=now();
      append('Scores',d);
    }
    out.push(old?find('Scores','scoreId',old.scoreId):d);
  }
  );
  return{
    count:out.length,records:out
  };
}
function submitScores(p){
  const s=role(p,['ADMIN','ACADEMIC_AFFAIRS','TEACHER','HOMEROOM_TEACHER']),tid=String(p.teachingId);
  const t=find('Teaching','teachingId',tid);
  if(!t)throw Error('ไม่พบตารางสอน');
  if(['TEACHER','HOMEROOM_TEACHER'].indexOf(s.role)>=0&&t.teacherId!==s.teacherId)throw Error('ไม่มีสิทธิ์');
  const a=rows('Scores').filter(x=>x.teachingId===tid);
  if(!a.length)throw Error('ยังไม่มีคะแนน');
  if(a.some(x=>x.workScore===''||x.midtermScore===''||x.finalScore===''))throw Error('คะแนนยังไม่ครบ');
  a.forEach(x=>update('Scores','scoreId',x.scoreId,{
    isSubmitted:true,submittedBy:s.userId,submittedAt:now(),updatedAt:now()
  }
  ));
  return{
    submitted:true,count:a.length
  };
}
function reopenScores(p){
  role(p,['ADMIN','ACADEMIC_AFFAIRS']);
  const a=rows('Scores').filter(x=>x.teachingId===String(p.teachingId));
  a.forEach(x=>update('Scores','scoreId',x.scoreId,{
    isSubmitted:false,updatedAt:now()
  }
  ));
  return{
    count:a.length
  };
}
function calcGrades(p){
  const f=p.filters||p;
  let a=rows('Scores');
  ['academicYear','term','teachingId','studentId'].forEach(k=>{
    if(f[k])a=a.filter(x=>String(x[k])===String(f[k]));
  }
  );
  let n=0;
  a.forEach(x=>{
    const sub=find('Subjects','subjectId',x.subjectId),d={
      academicYear:x.academicYear,term:x.term,studentId:x.studentId,subjectId:x.subjectId,classId:x.classId,teachingId:x.teachingId,credits:sub?num(sub.credits):0,totalScore:x.totalScore,grade:x.grade,gradePoint:point(x.grade),status:['0','ร','มส','มผ'].indexOf(normGrade(x.grade))>=0?'ABNORMAL':'NORMAL',remarks:x.abnormalReason||'',updatedAt:now()
    };
    const old=rows('Grades').find(g=>g.studentId===x.studentId&&g.subjectId===x.subjectId&&g.academicYear===x.academicYear&&g.term===x.term);
    if(old)update('Grades','gradeId',old.gradeId,d);
    else append('Grades',Object.assign({
      gradeId:id('GRADE'),createdAt:now()
    },d));
    n++;
  }
  );
  return{
    calculated:n
  };
}
function validateScores(p){
  loginRequired(p);
  const f=p.filters||p;
  let a=rows('Scores');
  if(f.teachingId)a=a.filter(x=>x.teachingId===String(f.teachingId));
  const issues=[];
  a.forEach(x=>{
    if(num(x.totalScore)>100)issues.push({
      type:'OVER_LIMIT',scoreId:x.scoreId,studentId:x.studentId
    }
    );
    if(x.workScore===''||x.midtermScore===''||x.finalScore==='')issues.push({
      type:'INCOMPLETE',scoreId:x.scoreId,studentId:x.studentId
    }
    );
    if(['ร','มส','มผ'].indexOf(normGrade(x.grade))>=0&&!String(x.abnormalReason||''))issues.push({
      type:'MISSING_REASON',scoreId:x.scoreId,studentId:x.studentId,grade:normGrade(x.grade)
    }
    );
  }
  );
  return{
    valid:!issues.length,issues:issues
  };
}
function grades(p){
  const s=loginRequired(p),f=p.filters||p;
  let a=rows('Grades');
  ['academicYear','term','studentId','classId','subjectId'].forEach(k=>{
    if(f[k])a=a.filter(x=>String(x[k])===String(f[k]));
  }
  );
  if(s.role==='STUDENT')a=a.filter(x=>x.studentId===s.studentId);
  if(s.role==='PARENT'){
    const ids=rows('Students').filter(x=>x.parentId===s.parentId).map(x=>x.studentId);
    a=a.filter(x=>ids.indexOf(x.studentId)>=0);
  }
  if(['TEACHER','HOMEROOM_TEACHER'].indexOf(s.role)>=0){
    const tids=rows('Teaching').filter(x=>x.teacherId===s.teacherId).map(x=>x.teachingId);
    a=a.filter(x=>tids.indexOf(x.teachingId)>=0);
  }
  return page(a,f);
}
function gpa(p){
  const s=loginRequired(p),f=p.filters||p,sid=String(f.studentId||(s.role==='STUDENT'?s.studentId:''));
  if(!sid)throw Error('กรุณาระบุ studentId');
  let a=rows('Grades').filter(x=>x.studentId===sid);
  if(f.academicYear)a=a.filter(x=>x.academicYear===String(f.academicYear));
  if(f.term)a=a.filter(x=>x.term===String(f.term));
  const valid=a.filter(x=>point(x.grade)!==null&&num(x.credits)>0);
  const cr=valid.reduce((z,x)=>z+num(x.credits),0),pt=valid.reduce((z,x)=>z+num(x.credits)*num(x.gradePoint),0);
  return{
    studentId:sid,gpa:cr?round(pt/cr,2):0,credits:cr,points:round(pt,2),records:a
  };
}
function gradeStats(p){
  loginRequired(p);
  const f=p.filters||p;
  let a=rows('Grades');
  ['academicYear','term','classId','subjectId'].forEach(k=>{
    if(f[k])a=a.filter(x=>String(x[k])===String(f[k]));
  }
  );
  const gp=a.map(x=>point(x.grade)).filter(x=>x!==null);
  return{
    total:a.length,distribution:distribution(a),averageGradePoint:gp.length?round(gp.reduce((z,x)=>z+x,0)/gp.length,2):0,abnormal:a.filter(x=>['0','ร','มส','มผ'].indexOf(normGrade(x.grade))>=0).length
  };
}
function abnormal(p){
  const s=loginRequired(p),f=p.filters||p;
  let a=rows('Grades').filter(x=>['0','ร','มส','มผ'].indexOf(normGrade(x.grade))>=0);
  if(f.type)a=a.filter(x=>normGrade(x.grade)===normGrade(f.type));
  if(f.studentId)a=a.filter(x=>x.studentId===String(f.studentId));
  if(s.role==='STUDENT')a=a.filter(x=>x.studentId===s.studentId);
  return page(a,f);
}
function attendance(p){
  const s=loginRequired(p),f=p.filters||p;
  let a=rows('Attendance');
  ['date','startDate','endDate','studentId','classId','subjectId','teachingId','academicYear','term'].forEach(k=>{
    if(f[k]){
      if(k==='startDate')a=a.filter(x=>x.date>=String(f[k]));
      else if(k==='endDate')a=a.filter(x=>x.date<=String(f[k]));
      else a=a.filter(x=>String(x[k])===String(f[k]));
    }
  }
  );
  if(s.role==='STUDENT')a=a.filter(x=>x.studentId===s.studentId);
  if(s.role==='PARENT'){
    const ids=rows('Students').filter(x=>x.parentId===s.parentId).map(x=>x.studentId);
    a=a.filter(x=>ids.indexOf(x.studentId)>=0);
  }
  if(['TEACHER','HOMEROOM_TEACHER'].indexOf(s.role)>=0){
    const tids=rows('Teaching').filter(x=>x.teacherId===s.teacherId).map(x=>x.teachingId);
    a=a.filter(x=>tids.indexOf(x.teachingId)>=0);
  }
  return page(a,f);
}
function saveAttendance(p){
  const s=role(p,['ADMIN','ACADEMIC_AFFAIRS','TEACHER','HOMEROOM_TEACHER']),list=p.entries||p.data;
  if(!Array.isArray(list))throw Error('entries ต้องเป็น Array');
  const out=[];
  list.forEach(e=>{
    const status=normAtt(e.status);
    if(['มา','ขาด','ลา','สาย','เข้าร่วมกิจกรรม','อื่น ๆ'].indexOf(status)<0)throw Error('สถานะการมาเรียนไม่ถูกต้อง');
    const d={
      academicYear:String(e.academicYear||currentYear()),term:String(e.term||currentTerm()),date:String(e.date||todayDate()),period:String(e.period||''),teachingId:String(e.teachingId||''),studentId:String(e.studentId||''),studentNumber:String(e.studentNumber||''),classId:String(e.classId||''),subjectId:String(e.subjectId||''),status:status,checkInTime:String(e.checkInTime||''),minutes:num(e.minutes),note:String(e.note||''),recordedBy:s.userId,updatedAt:now()
    };
    const old=rows('Attendance').find(x=>x.date===d.date&&x.period===d.period&&x.studentId===d.studentId&&x.teachingId===d.teachingId);
    if(old)update('Attendance','attendanceId',old.attendanceId,d);
    else{
      d.attendanceId=id('ATT');
      d.createdAt=now();
      append('Attendance',d);
    }
    out.push(old?find('Attendance','attendanceId',old.attendanceId):d);
  }
  );
  return{
    count:out.length,records:out
  };
}
function attendanceSummary(p){
  const s=loginRequired(p),f=p.filters||p;
  let st=rows('Students'),a=rows('Attendance');
  if(f.classId){
    st=st.filter(x=>x.classId===String(f.classId));
    a=a.filter(x=>x.classId===String(f.classId));
  }
  if(f.startDate)a=a.filter(x=>x.date>=String(f.startDate));
  if(f.endDate)a=a.filter(x=>x.date<=String(f.endDate));
  if(s.role==='STUDENT'){
    st=st.filter(x=>x.studentId===s.studentId);
    a=a.filter(x=>x.studentId===s.studentId);
  }
  if(s.role==='PARENT'){
    st=st.filter(x=>x.parentId===s.parentId);
    const ids=st.map(x=>x.studentId);
    a=a.filter(x=>ids.indexOf(x.studentId)>=0);
  }
  return st.map(x=>{
    const q=a.filter(y=>y.studentId===x.studentId),p0=q.filter(y=>normAtt(y.status)==='มา').length;
    return{
      studentId:x.studentId,studentNumber:x.studentNumber,name:x.firstName+' '+x.lastName,classId:x.classId,total:q.length,present:p0,absent:q.filter(y=>normAtt(y.status)==='ขาด').length,leave:q.filter(y=>normAtt(y.status)==='ลา').length,late:q.filter(y=>normAtt(y.status)==='สาย').length,activity:q.filter(y=>normAtt(y.status)==='เข้าร่วมกิจกรรม').length,attendancePercentage:q.length?round(p0/q.length*100,2):0
    };
  }
  );
}
function attendanceReports(p){
  const a=attendanceSummary(p);
  return{
    summary:a,belowMinimum:a.filter(x=>x.attendancePercentage<80),absentStudents:a.filter(x=>x.absent>0)
  };
}
function leaves(p){
  const s=loginRequired(p),f=p.filters||p;
  let a=rows('LeaveRequests');
  if(f.status)a=a.filter(x=>x.status===String(f.status));
  if(f.studentId)a=a.filter(x=>x.studentId===String(f.studentId));
  if(s.role==='STUDENT')a=a.filter(x=>x.studentId===s.studentId);
  if(s.role==='PARENT')a=a.filter(x=>x.parentId===s.parentId);
  if(s.role==='HOMEROOM_TEACHER')a=a.filter(x=>x.homeroomTeacherId===s.teacherId);
  return page(a,f);
}
function saveLeave(p){
  const s=loginRequired(p),d=p.data||{
  };
  const sid=String(d.studentId||(s.role==='STUDENT'?s.studentId:''));
  const st=find('Students','studentId',sid);
  if(!st)throw Error('ไม่พบนักเรียน');
  if(s.role==='STUDENT'&&s.studentId!==sid)throw Error('ไม่มีสิทธิ์');
  if(s.role==='PARENT'&&st.parentId!==s.parentId)throw Error('ไม่มีสิทธิ์');
  if(!d.startDate||!d.endDate)throw Error('กรุณาระบุวันที่ลา');
  const c=find('Classes','classId',st.classId);
  const r={
    leaveId:id('LEAVE'),requestNumber:nextDoc('LV'),studentId:sid,parentId:s.parentId||st.parentId||'',leaveType:d.leaveType||'ลากิจ',startDate:String(d.startDate),endDate:String(d.endDate),days:dateDiff(d.startDate,d.endDate),reason:String(d.reason||''),attachmentUrl:String(d.attachmentUrl||''),homeroomTeacherId:c?c.homeroomTeacherId:'',subjectTeacherId:'',academicAffairsId:'',approvedBy:'',approvedAt:'',status:'PENDING',approvalNote:'',createdAt:now(),updatedAt:now()
  };
  append('LeaveRequests',r);
  return r;
}
function approveLeave(p,ok){
  const s=role(p,['ADMIN','PRINCIPAL','ACADEMIC_AFFAIRS','HOMEROOM_TEACHER']),r=find('LeaveRequests','leaveId',String(p.leaveId));
  if(!r)throw Error('ไม่พบคำขอลา');
  update('LeaveRequests','leaveId',r.leaveId,{
    status:ok?'APPROVED':'REJECTED',approvedBy:s.userId,approvedAt:now(),approvalNote:String(p.note||''),updatedAt:now()
  }
  );
  if(ok)createLeaveAttendance(r);
  return find('LeaveRequests','leaveId',r.leaveId);
}
function createLeaveAttendance(r){
  const st=find('Students','studentId',r.studentId);
  if(!st)return;
  dateList(r.startDate,r.endDate).forEach(dt=>{
    if(!rows('Attendance').some(a=>a.studentId===r.studentId&&a.date===dt&&normAtt(a.status)==='ลา'))append('Attendance',{
      attendanceId:id('ATT'),academicYear:st.academicYear||'',term:currentTerm(),date:dt,period:'',teachingId:'',studentId:r.studentId,studentNumber:st.studentNumber||'',classId:st.classId||'',subjectId:'',status:'ลา',checkInTime:'',minutes:0,note:'จากคำขอลา '+r.requestNumber,recordedBy:r.approvedBy,createdAt:now(),updatedAt:now()
    }
    );
  }
  );
}
function remedial(p){
  const s=loginRequired(p),f=p.filters||p;
  let a=rows('Remedial');
  ['status','studentId','subjectId','classId','academicYear','term'].forEach(k=>{
    if(f[k])a=a.filter(x=>String(x[k])===String(f[k]));
  }
  );
  if(s.role==='STUDENT')a=a.filter(x=>x.studentId===s.studentId);
  if(s.role==='PARENT'){
    const ids=rows('Students').filter(x=>x.parentId===s.parentId).map(x=>x.studentId);
    a=a.filter(x=>ids.indexOf(x.studentId)>=0);
  }
  if(['TEACHER','HOMEROOM_TEACHER'].indexOf(s.role)>=0)a=a.filter(x=>x.teacherId===s.teacherId);
  return page(a,f);
}
function saveRemedial(p){
  const s=role(p,['ADMIN','ACADEMIC_AFFAIRS','TEACHER','HOMEROOM_TEACHER']),d=p.data||{
  };
  if(d.remedialId){
    const u=Object.assign({
    },d,{
      updatedAt:now()
    }
    );
    delete u.remedialId;
    update('Remedial','remedialId',d.remedialId,u);
    return find('Remedial','remedialId',d.remedialId);
  }
  const r={
    remedialId:id('REM'),remedialNumber:nextDoc('RM'),academicYear:String(d.academicYear||currentYear()),term:String(d.term||currentTerm()),studentId:String(d.studentId||''),subjectId:String(d.subjectId||''),classId:String(d.classId||''),teacherId:String(d.teacherId||s.teacherId||''),originalGrade:String(d.originalGrade||''),reasonType:String(d.reasonType||''),reason:String(d.reason||''),assignedDate:String(d.assignedDate||todayDate()),dueDate:String(d.dueDate||''),task:String(d.task||''),beforeScore:num(d.beforeScore),afterScore:d.afterScore===''?'':num(d.afterScore),afterGrade:String(d.afterGrade||''),actionDate:String(d.actionDate||''),note:String(d.note||''),status:String(d.status||'รอดำเนินการ'),createdAt:now(),updatedAt:now()
  };
  append('Remedial',r);
  return r;
}
function updateRemedial(p){
  loginRequired(p);
  const r=find('Remedial','remedialId',String(p.remedialId));
  if(!r)throw Error('ไม่พบรายการ');
  const u={
    status:String(p.status||r.status),note:String(p.note||r.note||''),actionDate:String(p.actionDate||r.actionDate||todayDate()),updatedAt:now()
  };
  if(p.afterScore!==undefined)u.afterScore=num(p.afterScore);
  if(p.afterGrade!==undefined)u.afterGrade=String(p.afterGrade);
  update('Remedial','remedialId',r.remedialId,u);
  return find('Remedial','remedialId',r.remedialId);
}
function createDocument(p){
  const s=loginRequired(p),d=p.data||{
  },r={
    documentId:id('DOC'),documentNumber:nextDoc(String(d.prefix||'DOC')),documentType:String(d.documentType||''),studentId:String(d.studentId||''),academicYear:String(d.academicYear||currentYear()),term:String(d.term||currentTerm()),requestedBy:s.userId,issuedBy:s.userId,issueDate:todayDate(),fileUrl:String(d.fileUrl||''),status:'ISSUED',notes:String(d.notes||''),createdAt:now(),updatedAt:now()
  };
  if(!r.documentType)throw Error('กรุณาระบุ documentType');
  append('Documents',r);
  return r;
}
function documentData(p){
  const s=loginRequired(p),sid=String(p.studentId||'');
  const st=find('Students','studentId',sid);
  if(!st)throw Error('ไม่พบนักเรียน');
  if(s.role==='STUDENT'&&s.studentId!==sid)throw Error('ไม่มีสิทธิ์');
  const g=rows('Grades').filter(x=>x.studentId===sid),a=rows('Attendance').filter(x=>x.studentId===sid);
  return{
    documentType:p.documentType||'',generatedAt:now(),school:getSettings(),student:st,grades:g,attendance:a,gpa:gpaFrom(g),documentNumber:nextDoc('DOC')
  };
}
function announcements(p){
  const s=loginRequired(p),f=p.filters||p,a=activeAnnouncements(s.role,100);
  return f.limit?a.slice(0,Number(f.limit)):a;
}
function saveAnnouncement(p){
  const s=role(p,['ADMIN','PRINCIPAL','ACADEMIC_AFFAIRS']),d=p.data||{
  };
  if(!d.title||!d.content)throw Error('กรุณาระบุหัวข้อและเนื้อหา');
  return saveOne('Announcements',Object.assign({
  },d,{
    createdBy:d.createdBy||s.userId,status:d.status||'ACTIVE',priority:d.priority||'NORMAL'
  }
  ),p);
}
function notifications(p){
  const s=loginRequired(p);
  return rows('Notifications').filter(x=>x.userId===s.userId).sort((a,b)=>String(b.createdAt).localeCompare(String(a.createdAt))).slice(0,100);
}
function markNotification(p){
  const s=loginRequired(p),r=find('Notifications','notificationId',String(p.notificationId));
  if(!r||r.userId!==s.userId)throw Error('ไม่พบการแจ้งเตือน');
  update('Notifications','notificationId',r.notificationId,{
    isRead:true,readAt:now()
  }
  );
  return find('Notifications','notificationId',r.notificationId);
}
function academicReport(p){
  return{
    school:schoolReport(p),grades:gradeStats(p),attendance:attendanceReports(p),students:students(p)
  };
}
function classReport(p){
  const cid=String(p.classId),st=rows('Students').filter(x=>x.classId===cid),g=rows('Grades').filter(x=>x.classId===cid),a=rows('Attendance').filter(x=>x.classId===cid);
  return{
    classId:cid,students:st,grades:g,attendance:a,gradeDistribution:distribution(g),gpa:gpaFrom(g)
  };
}
function schoolReport(p){
  const st=rows('Students'),g=rows('Grades'),a=rows('Attendance'),gp=g.map(x=>point(x.grade)).filter(x=>x!==null),present=a.filter(x=>normAtt(x.status)==='มา').length;
  return{
    students:{
      total:st.filter(x=>x.status!=='INACTIVE').length,male:st.filter(x=>gender(x.gender)==='ชาย').length,female:st.filter(x=>gender(x.gender)==='หญิง').length,graduated:st.filter(x=>x.status==='GRADUATED').length,resigned:st.filter(x=>x.status==='RESIGNED').length
    },teachers:rows('Teachers').length,classes:rows('Classes').length,subjects:rows('Subjects').length,averageGPA:gp.length?round(gp.reduce((x,y)=>x+y,0)/gp.length,2):0,gradeDistribution:distribution(g),attendanceRate:a.length?round(present/a.length*100,2):0
  };
}
function saveSettings(p){
  const s=role(p,['ADMIN','PRINCIPAL','ACADEMIC_AFFAIRS']);
  const d=Object.assign({},p.data||{});
  const rows0=rows('Settings');
  if(!rows0.length){
    const r=Object.assign({},d,{settingId:id('SET'),createdAt:now(),updatedAt:now()});
    append('Settings',r);
    audit(s,'CREATE','Settings',r.settingId,'บันทึกการตั้งค่าระบบ',r);
    return r;
  }
  const old=rows0[0];
  delete d.settingId;
  delete d.createdAt;
  d.updatedAt=now();
  update('Settings','settingId',old.settingId,d);
  const r=find('Settings','settingId',old.settingId);
  audit(s,'UPDATE','Settings',old.settingId,'บันทึกการตั้งค่าระบบ',d);
  return r;
}
function getSettings(){
  const a=rows('Settings');
  return a[0]||{
  };
}
function list(n,p,hide){
  if(!SCHEMA[n])throw Error('Sheet ไม่ได้รับอนุญาต');
  const f=p.filters||p;
  let a=rows(n);
  if(f.search){
    const q=String(f.search).toLowerCase();
    a=a.filter(x=>Object.keys(x).some(k=>String(x[k]||'').toLowerCase().includes(q)));
  }
  Object.keys(f).forEach(k=>{
    if(['token','action','filters','search','page','pageSize','hideSensitive'].indexOf(k)>=0||f[k]===''||f[k]===undefined||f[k]===null)return;
    a=a.filter(x=>String(x[k]||'')===String(f[k]));
  }
  );
  if(hide&&n==='Users')a=a.map(publicUser);
  return page(a,f);
}
function saveOne(n,d,p){
  if(!SCHEMA[n])throw Error('Sheet ไม่ได้รับอนุญาต');
  d=d||{
  };
  const key=SCHEMA[n][0];
  if(d[key]){
    const old=find(n,key,d[key]);
    if(!old)throw Error('ไม่พบข้อมูล');
    const u=Object.assign({
    },d,{
      updatedAt:now()
    }
    );
    delete u[key];
    delete u.createdAt;
    update(n,key,d[key],u);
    return find(n,key,d[key]);
  }
  const r=Object.assign({
  },d,{
    [key]:id(n.toUpperCase()),createdAt:now(),updatedAt:now()
  }
  );
  append(n,r);
  return r;
}
function del(n,p){
  if(!SCHEMA[n])throw Error('Sheet ไม่ได้รับอนุญาต');
  const key=SCHEMA[n][0],v=String(p.id||p.recordId||p[key]||'');
  if(!v)throw Error('กรุณาระบุ ID');
  const s=db().getSheetByName(n),idx=SCHEMA[n].indexOf(key),vals=s.getRange(2,idx+1,Math.max(s.getLastRow()-1,1),1).getValues();
  for(let i=0;
  i<vals.length;
  i++)if(String(vals[i][0])===v){
    s.deleteRow(i+2);
    return{
      deleted:true,id:v
    };
  }
  throw Error('ไม่พบข้อมูล');
}
function db(){
  let idv=String(CONFIG.SPREADSHEET_ID||'').trim();
  if(!idv||idv==='PUT_YOUR_GOOGLE_SHEET_ID_HERE')idv=PropertiesService.getScriptProperties().getProperty('ARAMS_SPREADSHEET_ID')||'';
  if(!idv)throw Error('กรุณาใส่ Google Spreadsheet ID ใน CONFIG.SPREADSHEET_ID');
  try{
    return SpreadsheetApp.openById(idv)
  }catch(e){
    throw Error('เปิด Google Sheet ไม่ได้ กรุณาตรวจสอบ Spreadsheet ID และสิทธิ์');
  }
}
function sheet(n){
  if(!SCHEMA[n])throw Error('ไม่มี Schema: '+n);
  let s=db().getSheetByName(n);
  if(!s){
    ensureSheet(db(),n,SCHEMA[n]);
    s=db().getSheetByName(n);
  }
  return s;
}
function rows(n){
  const s=sheet(n),lr=s.getLastRow(),lc=SCHEMA[n].length;
  if(lr<2)return[];
  const h=SCHEMA[n],v=s.getRange(2,1,lr-1,lc).getValues();
  return v.filter(r=>r.some(x=>x!==''&&x!==null&&x!==undefined)).map(r=>{
    const o={
    };
    h.forEach((k,i)=>o[k]=cell(r[i]));
    return o;
  }
  );
}
function append(n,o){
  const s=sheet(n);
  s.appendRow(SCHEMA[n].map(k=>o[k]===undefined||o[k]===null?'':o[k]));
}
function update(n,k,v,u){
  const s=sheet(n),h=SCHEMA[n],idx=h.indexOf(k),lr=s.getLastRow();
  if(idx<0||lr<2)throw Error('ไม่พบ ID field');
  const ids=s.getRange(2,idx+1,lr-1,1).getValues();
  for(let i=0;
  i<ids.length;
  i++)if(String(ids[i][0])===String(v)){
    const row=s.getRange(i+2,1,1,h.length).getValues()[0];
    h.forEach((x,j)=>{
      if(Object.prototype.hasOwnProperty.call(u,x))row[j]=u[x]
    }
    );
    s.getRange(i+2,1,1,h.length).setValues([row]);
    return true;
  }
  throw Error('ไม่พบข้อมูล '+v);
}
function find(n,k,v){
  return rows(n).find(x=>String(x[k]||'')===String(v||''))||null;
}
function page(a,f){
  f=f||{
  };
  const p=Math.max(1,parseInt(f.page||1,10)),z=Math.min(500,Math.max(1,parseInt(f.pageSize||CONFIG.PAGE_SIZE,10))),start=(p-1)*z;
  return{
    data:a.slice(start,start+z),total:a.length,page:p,pageSize:z,totalPages:Math.ceil(a.length/z)
  };
}
function audit(s,a,e,idv,m,p){
  try{
    append('AuditLogs',{
      logId:id('LOG'),userId:s?s.userId:'',username:s?s.username:'',role:s?s.role:'',action:a,entity:e,entityId:idv||'',method:m||'',payloadSummary:safe(p),ip:'',createdAt:now()
    }
    );
  }catch(x){
  }
}
function safe(x){
  try{
    let o=JSON.parse(JSON.stringify(x||{
    }
    ));
    ['password','passwordHash','passwordSalt'].forEach(k=>{
      if(o[k])o[k]='***'
    }
    );
    let t=JSON.stringify(o);
    return t.length>2000?t.slice(0,2000)+'...':t
  }catch(e){
    return''
  }
}
function request(e){
  if(e&&e.postData&&e.postData.contents){
    try{
      return JSON.parse(e.postData.contents)
    }catch(x){
    }
  }
  const o={
  };
  if(e&&e.parameter)Object.keys(e.parameter).forEach(k=>{
    try{
      o[k]=JSON.parse(e.parameter[k])
    }catch(x){
      o[k]=e.parameter[k]
    }
  }
  );
  return o;
}
function out(x){
  return ContentService.createTextOutput(JSON.stringify(x)).setMimeType(ContentService.MimeType.JSON);
}
function errObj(e){
  return{
    success:false,error:e&&e.message?e.message:String(e),timestamp:now()
  };
}
function now(){
  return Utilities.formatDate(new Date(),CONFIG.TZ,'yyyy-MM-dd HH:mm:ss');
}
function todayDate(){
  return Utilities.formatDate(new Date(),CONFIG.TZ,'yyyy-MM-dd');
}
function cell(v){
  return v instanceof Date?Utilities.formatDate(v,CONFIG.TZ,'yyyy-MM-dd HH:mm:ss'):v;
}
function id(p){
  return String(p||'ID')+'_'+Utilities.formatDate(new Date(),CONFIG.TZ,'yyyyMMddHHmmss')+'_'+Utilities.getUuid().replace(/-/g,'').slice(0,10);
}
function hash(p,s){
  return Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,String(s)+':'+String(p),Utilities.Charset.UTF_8).map(b=>{
    b=b<0?b+256:b;
    return('0'+b.toString(16)).slice(-2)
  }
  ).join('');
}
function num(v){
  if(v===''||v===null||v===undefined)return 0;
  const n=Number(v);
  return isNaN(n)?0:n;
}
function numNull(v){
  if(v===''||v===null||v===undefined)return null;
  const n=Number(v);
  return isNaN(n)?null:n;
}
function round(n,d){
  const q=Math.pow(10,d||0);
  return Math.round(Number(n)*q)/q;
}
function gender(v){
  v=String(v||'').trim();
  return['M','Male','ชาย'].indexOf(v)>=0?'ชาย':['F','Female','หญิง'].indexOf(v)>=0?'หญิง':v;
}
function normGrade(v){
  v=String(v||'').trim();
  if(v.toLowerCase()==='r')return'ร';
  if(v.toLowerCase()==='ms')return'มส';
  if(v.toLowerCase()==='mp')return'มผ';
  return v;
}
function normAtt(v){
  v=String(v||'').trim();
  const m={
    present:'มา',Present:'มา','มาเรียน':'มา',absent:'ขาด',Absent:'ขาด',leave:'ลา',Leave:'ลา',late:'สาย',Late:'สาย',activity:'เข้าร่วมกิจกรรม'
  };
  return m[v]||v;
}
function grade(n){
  n=num(n);
  const r=rows('GradeRules').filter(x=>x.status!=='INACTIVE');
  for(let i=0;
  i<r.length;
  i++)if(n>=num(r[i].minScore)&&n<=num(r[i].maxScore))return String(r[i].grade);
  if(n>=80)return'4';
  if(n>=75)return'3.5';
  if(n>=70)return'3';
  if(n>=65)return'2.5';
  if(n>=60)return'2';
  if(n>=55)return'1.5';
  if(n>=50)return'1';
  return'0';
}
function point(g){
  g=normGrade(g);
  const m={
    '4':4,'3.5':3.5,'3':3,'2.5':2.5,'2':2,'1.5':1.5,'1':1,'0':0
  };
  return Object.prototype.hasOwnProperty.call(m,g)?m[g]:null;
}
function distribution(a){
  const d={
    '4':0,'3.5':0,'3':0,'2.5':0,'2':0,'1.5':0,'1':0,'0':0,'ร':0,'มส':0,'มผ':0
  };
  a.forEach(x=>{
    const g=normGrade(x.grade);
    if(d[g]!==undefined)d[g]++
  }
  );
  return d;
}
function gpaFrom(a){
  const v=a.filter(x=>point(x.grade)!==null&&num(x.credits)>0),c=v.reduce((s,x)=>s+num(x.credits),0),p=v.reduce((s,x)=>s+num(x.credits)*point(x.grade),0);
  return c?round(p/c,2):0;
}
function currentYear(){
  const s=getSettings();
  if(s.currentAcademicYear)return String(s.currentAcademicYear);
  const a=rows('AcademicYears').find(x=>x.status==='ACTIVE');
  return a?String(a.academicYear||''):'';
}
function currentTerm(){
  const s=getSettings();
  if(s.currentTerm)return String(s.currentTerm);
  const a=rows('Terms').find(x=>x.status==='ACTIVE');
  return a?String(a.term||''):'';
}
function schoolName(){
  try{
    const s=getSettings();
    return s.schoolName||CONFIG.SCHOOL_NAME
  }catch(e){
    return CONFIG.SCHOOL_NAME
  }
}
function nextDoc(prefix){
  const a=rows('Settings');
  if(!a.length)setupSystem();
  const s=rows('Settings')[0],n=parseInt(s.nextDocumentNumber||1,10),v=String(n).padStart(6,'0');
  update('Settings','settingId',s.settingId,{
    nextDocumentNumber:n+1,updatedAt:now()
  }
  );
  return String(s.documentPrefix||'ARAMS')+'-'+String(prefix||'DOC')+'-'+v;
}
function dateDiff(a,b){
  const x=parseDate(a),y=parseDate(b);
  return x&&y?Math.floor((y-x)/86400000)+1:0;
}
function dateList(a,b){
  const x=parseDate(a),y=parseDate(b),r=[];
  if(!x||!y)return r;
  for(let d=new Date(x);
  d<=y;
  d.setDate(d.getDate()+1))r.push(Utilities.formatDate(d,CONFIG.TZ,'yyyy-MM-dd'));
  return r;
}
function parseDate(v){
  const p=String(v||'').split('-');
  return p.length===3?new Date(Number(p[0]),Number(p[1])-1,Number(p[2])):null;
}
function activeAnnouncements(roleName,limit){
  const d=todayDate();
  return rows('Announcements').filter(x=>x.status!=='INACTIVE'&&(!x.publishStart||x.publishStart<=d)&&(!x.publishEnd||x.publishEnd>=d)&&(String(x.audience||'ALL').toUpperCase()==='ALL'||String(x.audience||'').toUpperCase()===String(roleName).toUpperCase()||(x.audience==='STUDENTS'&&roleName==='STUDENT')||(x.audience==='TEACHERS'&&(roleName==='TEACHER'||roleName==='HOMEROOM_TEACHER'))||(x.audience==='PARENTS'&&roleName==='PARENT'))).sort((a,b)=>String(b.createdAt).localeCompare(String(a.createdAt))).slice(0,limit||10);
}
function verifySystem(){
  const ss=db();
  return Object.keys(SCHEMA).map(n=>({
    sheet:n,exists:!!ss.getSheetByName(n),columns:SCHEMA[n].length
  }
  ));
}
function setSpreadsheetId(v){
  v=String(v||'').trim();
  SpreadsheetApp.openById(v);
  PropertiesService.getScriptProperties().setProperty('ARAMS_SPREADSHEET_ID',v);
  return{
    success:true,spreadsheetId:v
  };
}
