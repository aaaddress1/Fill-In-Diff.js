/**
*   Fill-In-Diff.js
*
*   diff the correct words, wrong words and extra words among 
*   answer document, exam document and user input document.
*
*   Author: aaaddress1@gmail.com
**/

/* kpdecker/jsdiff <https://github.com/kpdecker/jsdiff> */
JsDiff = require('./diff.js');
fs = require('fs');

var getPlantExamText = function(data) {
  data = data.replace(/\x20an\x20|\x20a\x20|\x20the\x20/gi, '\x20');
  data = data.replace(/\x20\x20/g, ' ');  
  return data;
}

var findLack = function( pos, currContent ) {
  respHtml = '';
  var lastPos = pos + currContent.length;
  var u = -1;
  while (pos < lastPos) {
    for(u = pos; u < lastPos ; u++)
      if (usr[u] != lack[u]) break;

    l = u;
    var lackWord = ''
    while ((u < lastPos)&&(usr[u] != ' '))
      lackWord += usr[u++];

    lack = [lack.slice(0, l), lackWord, '\x20', lack.slice(l)].join('');
    respHtml += usr.slice(pos, l) + '<h style="color:green;">' + lackWord + '</h>';
    pos = u;
  }
  return respHtml;
}

var diffExam = function( psrc, plack, pusr, callback ) {
  src = psrc.replace(/\x20\x20/g, ' ').replace(/\r\n/g, '\n'); 
  usr = pusr.replace(/\x20\x20/g, ' ').replace(/\r\n/g, '\n'); 
  lack = plack.replace(/\x20\x20/g, ' ').replace(/\r\n/g, '\n'); 

  var usrPos = 0;
  var diffSrc = JsDiff.diffWords(src, lack);
  var diffUsr = JsDiff.diffWords(src, usr);

  var resp = '<style>body { color: white; background: black; }</style><body>'

  for (var u = 0, s = 1; u < diffUsr.length; u++) {
    if ((diffUsr[u].added == undefined) && (diffUsr[u].removed == undefined)) {
      resp += findLack(usrPos, diffUsr[u].value);
      usrPos += diffUsr[u].value.length;
    }
    else if (diffUsr[u].removed) {
        usr = [usr.slice(0, usrPos), diffUsr[u].value, usr.slice(usrPos)].join('');
        lack = [lack.slice(0, usrPos), diffUsr[u].value, lack.slice(usrPos)].join('').replace(/\x20\x20/g,'\x20');
        resp += '<del style="color:red;">' + diffUsr[u].value + '</del>';
        usrPos += diffUsr[u].value.length;
    }
     else if (diffUsr[u].added) {
        usr = [usr.slice(0, usrPos), usr.slice(usrPos+diffUsr[u].value.length)].join('');
        lack = [usr.slice(0,usrPos), lack.slice(usrPos)].join('');
        resp += '<del style="color:yellow;">' +  diffUsr[u].value + '</del>';
     }
    usr = usr.replace(/\x20\x20/g, ' ');
    lack = lack.replace(/\x20\x20/g, ' ');
  }
  callback(resp);
}

/* main */
src = fs.readFileSync('./sample.txt','utf8');
usr = fs.readFileSync('./usrAns.txt','utf8');
lack= getPlantExamText(src);
fs.writeFileSync('./Exam.txt',lack, 'utf8');

diffExam(src, lack, usr,function(htmlOut) {
  fs.writeFile('./display.html', htmlOut);
});

