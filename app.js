var userconnected= 0,
    stopNotifInt = false,
    accessToken,
    dizUser = {},
    voteUser = {},
    myHistory = [],
    notifSave = [],
    emotsLib = {},
    clearTitlePage,
    sounds;

$(function(){

  console.log('APP.js');
  

  $('.changePicture').click(function(){
    $('.file-upload').click();
  });

 

    


});

const cloudName = 'therank-me';
const unsignedUploadPreset = 'uhxlb6ii';

// *********** Handle selected files ******************** //
var handleFiles = function(files) {
  for (var i = 0; i < files.length; i++) {
    uploadFile(files[i]); // call the function to upload the file
  }
};

// *********** Upload file to Cloudinary ******************** //
function uploadFile(file) {
  var url = 'https://api.cloudinary.com/v1_1/'+cloudName+'/upload';
  var xhr = new XMLHttpRequest();
  var fd = new FormData();
  xhr.open('POST', url, true);
  xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
  
  // Update progress (can be used to show progress indicator)
  xhr.upload.addEventListener("progress", function(e) {
    $('.changePicture').attr('src', "img/loader02.gif");
    var progress = Math.round((e.loaded * 100.0) / e.total);

    console.log(`fileuploadprogress data.loaded: ${e.loaded}, data.total: ${e.total}`);
  });

  xhr.onreadystatechange = function(e) {
    if (xhr.readyState == 4 && xhr.status == 200) {
      // File uploaded successfully
      var response = JSON.parse(xhr.responseText);
      // https://res.cloudinary.com/cloudName/image/upload/v1483481128/public_id.jpg
      var url = response.secure_url;
      // Create a thumbnail of the uploaded image, with 150px width
      var tokens = url.split('/');
      tokens.splice(-2, 0, 'w_450,h_450,c_crop');
      var img = {};
      img.src = tokens.join('/');
      img.alt = response.public_id;
      // console.log('IMG UPLOADED ------- >', img);
      dataSend = { userid: dizUser.id, imgsrc: img.src };
      // console.log(dataSend);
      $.post( "updateimg.php", dataSend , function( data ) {
        // console.log("-- updateimg : ", data);
        getUser();
      });
    }
  };

  fd.append('upload_preset', unsignedUploadPreset);
  fd.append('tags', 'browser_upload'); // Optional - add tag for image admin in Cloudinary
  fd.append('file', file);
  xhr.send(fd);

}


function APPlaunch(){
   
  FB.getLoginStatus(function(response) {
    // $('.loader').hide();
    console.log('FB LOGGED STATUS', response);
    if( response.status == "connected" ){
      userconnected = 1;
      accessToken = response.authResponse.accessToken;
      $('body').addClass('connected');

      getUser();

      
    }else{
      popSection('intro');
    }

  });

  $('.fb_connect').click(function(){
    FB.login(function(response) {
        if (response.authResponse) {
            window.location.reload();
        }
    // }, {scope:'email, user_photos, user_gender, user_age_range, user_friends', return_scopes: true});
    }, {scope:'email'});
  });


  $('.passProfil').click(function(){
    getNextPeople(false);
    return false;
  });
  $('.submitRate').click(votePeople);

  // $('.changePhoto, .share-profile .picture_frame').click(function(){
  //   getPhotos();
  //   openPopin('change-photo-container');
  //   return false;
  // });
  $('.overlay').click(function(){
    $('.popin').hide();
    $('.alert-popup').hide();
    $('.overlay').hide();
  });

  $('input#public').change(goPublic);
  $('input#notify').change(goNotify);

  $('.popSection').click( function(){
    section = $(this).attr('section');
    popSection(section);
    return false;
  });


  $('.sharer').click( function(){
    urlProfil = window.location.origin+window.location.pathname+'?id='+dizUser.id;
    console.log('sharer : ', urlProfil);
    FB.ui({
      method: 'share',
      href: urlProfil
    }, function(response){

    });
    return false;
  });

  // SHOP CLICK
  $('.shop .shop-cancel').click(function(){
    shopPopup.hide();
    $('.overlay').hide();
    return false
  });

  $('.shop .shop-ok').click(function(){
    console.log('BUY SHOP CLICK');
    itemid = $('.shop .shop-icon img').attr('id');
    buytoShop(itemid);
    return false;
  });

  // NOTIF CLICK

  clearTitlePage = document.title;

  $('.notif-icon').click(function(){
    $('.notifs-list').toggle();
  });
  $('.notifs-list ul').on('click', 'li', function(){
    clearNotif( $(this).attr('id') );
  });

  notifInterval = setInterval(function(){
    if(userconnected && !stopNotifInt){
      getNotifs();
    }
  }, 5000);

}



function checkState(){
  var url_string = window.location.href ; //window.location.href
  var url = new URL(url_string);
  var friendID = url.searchParams.get("id");
  if(friendID){
    loadFriend(friendID);
  }
  else{
    if(window.location.href.indexOf("#") > -1) {
      url= window.location.href;
      section = url.substring(url.indexOf("#")+1);
      console.log(section);
      if(section != ""){
        popSection(section);
      }else{
        popSection('my-profile');
      }
    }
    else{
      popSection('my-profile');
    }
  }
  
}
function openPopin(popin){
  $('.popin').hide();
  $('.'+popin).show().css({'top': $('html').scrollTop() + 60 });
  $('.overlay').show();
}

function closePopin(){
  $('.popin').hide();
  $('.overlay').hide();
}

function popSection(section){
  console.log('popSection :: ', section);
  gtag('event', 'click', {
    'event_category': section
  });
  if($('.'+section).length == 0){
    section = "my-profile";
  }
  $('.loader').show();
  $('section').hide();
  $('.'+section).show();
  $('.loader').hide();

  if( $('.'+section).find('.emots-bag').length ){
    getEmotsBag('.'+section);
  }
  if( section == "rank-system"){
    rangeSelector();
    getNextPeople(function(){
      $('.loader').delay(400).fadeOut(300);
    });
  }
  if( section == "my-profile"){
    getUserRank();
    // getUser();
  }
  if( section == "top-table"){
    getTopTable();
  }

  if (window.history.pushState) {
    console.log('PUSH STATE ===== ', section);
    window.history.pushState(myHistory, 'The Rank - '+section, '#'+section);
  }

  
}

function getTopTable(){
  $('.table-rank tbody').after('<tfoot><td colspan="4"><img class="loader-table" src="img/loader02.gif" /></td></tfoot>');
  $.post( "elorating.php", {'userID':dizUser.id}, function( data ) {
    data = JSON.parse(data);
    $('.table-rank tbody').empty();
    console.log("getTopTable :: ", data);
    $.each( data.toptable , function( key, item ) {
      username = item.name.split(' ').slice(0, -1).join(' ') +" "+ item.name.split(' ').slice(-1).join(' ').slice(0,1)+".";
      $('.table-rank tbody').append("<tr><td>"+(key+1)+"</td><td class='table-pic'><div><img src='"+item.picture+"' /></div></td><td class='table-name'>"+username+"</td><td class='table-note'>"+item.note+"</td><td class='table-elo'>"+item.elo+"</td></tr>");
    });
    $('tfoot').remove();
  });

}

function getNotifs(){
  
  // $('.notifs-list').prepend('<img class="loader-notifs" width="26" src="img/loader02.gif" style="margin:auto; display:block" />');
  $.post( "notifs.php", {'id':dizUser.id}, function( data ) {
    data = JSON.parse(data);
    console.log("getNotifs ==> ", data);
    notifsCount = data.notifs.length;

    if(notifsCount){
      $('.notif-icon i').text(notifsCount).attr('count',notifsCount).show();
      document.title =  '('+notifsCount+') '+ clearTitlePage;
      $('.notifs-list .nonotifs').hide();
    }else{
      $('.notif-icon i').hide(); 
      $('.notifs-list .nonotifs').show();
    }
    // $('.notifs-list ul').empty();
    $.each( data.notifs , function( key, item ) {
      type = JSON.parse(item.type);
      // console.log("notif == ", item, type);
      if(notifSave.length){
        var i = notifSave.indexOf(parseInt(item.id));
        if(i == -1) {
          notifSave.push(parseInt(item.id));
        }
      }else{
        notifSave.push(parseInt(item.id));
      }
      if( !$('.notifs-list ul').find('#'+item.id).length ){
        new Audio('sounds/pop-snd.wav').play();
        $('.notifs-list ul').prepend('<li id="'+item.id+'"><span class="type-icon"><i class="type-icon-'+type.emots_id+'"></i></span><p>'+item.text+' <b class="notifs-credit-win">+'+item.credit+'</b></p><span class="notif-get-refund"><b>cash</b></span></li>');
      }
      
    });
    // $('.loader-notifs').remove();
  });

}

function clearNotif(id){
  console.log("clearNotif  ! ", id); 
  if(id){
    $.post( "notifs.php", {'id':dizUser.id, 'notifid':id }, function( data ) {
      data = JSON.parse(data);
      console.log(data);
      
      
      if(data.notifdeleted){
        popCoins(data.creditwin);
        getUser();
        notifsCount = $('.notif-icon i').attr('count')-1;
        $('.notif-icon i').text(notifsCount).attr('count',notifsCount);
        if( notifsCount == 0){
          document.title =  clearTitlePage;
          $('.notif-icon i').hide();
          $('.notifs-list .nonotifs').show();
        }else{
          document.title =  '('+notifsCount+') '+ clearTitlePage;
          $('.notifs-list .nonotifs').hide();
        }
        var i = notifSave.indexOf(id);
        console.log(" i == >>>>>>>>>>>", i, id);        
        if(i != -1) {
          notifSave.splice(i, 1);
        }
        $('.notifs-list ul li#'+id).remove();
      }
    });
  }

}

function getUser(callback){

  FB.api(
  '/me',
  'GET',
  {"fields": "id,name,email,friends", access_token: accessToken},
  function(response) {
    console.log('ME : ', response);
    fbinfo = {};
    fbinfo['fbid'] = response.id;
    fbinfo['name'] = response.name;
    fbinfo['email'] = response.email;
    fbinfo['imgsrc'] = "https://graph.facebook.com/" + response.id + "/picture?type=large";

    dizUser = fbinfo;
    registerNewUser(fbinfo);
    
    if(response.friends.data.length){
      getFriends(response.friends.data);
    }

    if(callback){
      callback();
    }
 
  });

}

function getFriends(friends){
  console.log('FRIENDS : ', friends, friends.length);
  $('.friends-overlook').empty();
  if(friends.length==0){
    $('.friends-ranked p').html("<b>Be the first</b> of your friends to get ranked!"); 
  }else if(friends.length==1){
    $('.friends-ranked b').text(friends.length+" friend");
  }else{
    $('.friends-ranked b').text(friends.length+" friends"); 
  }
  $.each( friends , function( key, item ) {
    console.log(item.id, item.name);
    $.post( "getuserinfo.php", {'friendid':item.id}, function( data ) {
      data = JSON.parse(data);
      console.log("Friendinfo received! :: ", data.friendinfo);
      $('.friends-overlook').append('<li><img src="'+data.friendinfo.picture+'" alt="'+data.friendinfo.name+'" /> <span>'+data.friendinfo.name+'</span></li>');
    });
  });

}

function getEmotsBag(section){

  console.log( 'getEmotsBag => ', section);
  emotsBagSelector = $(section).find('.emots-bag');
  emotsBagSelector.find('ul').empty().before('<img class="loader-emotsbag" src="img/loader02.gif" />');
  $.get( "getemots.php", function( allEmots ) {
    allEmots = JSON.parse(allEmots);
    // globalEmots = allEmots;
    emotsLib = allEmots;

    $.post( "getemots.php", {'userid':dizUser.id}, function( myEmots ) {
      myEmots = JSON.parse(myEmots);
      myEmots = JSON.parse(myEmots.useremots.emots_bag);
      // console.log("allEmots :: ", allEmots);
      // console.log('myEmots :: ', myEmots );
      emotsBagSelector.find('.loader-emotsbag').remove();
      
      $.each( allEmots.emots , function( key, item ) {
        // console.log(key, item);
        // console.log(item.picture);
        emotsBagSelector.find('ul').append('<li class="locked" id="'+item.id+'"><img src="img/emots/'+item.picture+'"/></li>');
      });
      // console.log('LAUNCH SELECTOR');
      $.each( myEmots , function( key02, item02 ) {
        // console.log('UNLOCK : ', item02);
        emotsBagSelector.find('ul li#'+item02).removeClass('locked');
      });
      selectEmots();

    });

  });

}



function goPublic(){
  goPublic = $('input#public').is(':checked');
  // console.log({'goPublic':goPublic, 'userid':dizUser.id});
  $.post( "register.php", {'goPublic':goPublic, 'userid':dizUser.id}, function( data ) {
    // tData = JSON.parse(data);
    // console.log("Data received! public :: ", data);
  });
}
function goNotify(){
  goNotify = $('input#notify').is(':checked');
  // console.log({'goNotify':goNotify, 'userid':dizUser.id});
  $.post( "register.php", {'goNotify':goNotify, 'userid':dizUser.id}, function( data ) {
    // tData = JSON.parse(data);
    // console.log("Data received! notify :: ", data);
  });
}

function appendUserInfo(){
  // console.log('dizUser.imgsrc', dizUser.picture);

  $('.share-profile .picture_frame img').attr('src', dizUser.picture);
  $('.my-profile-pic').attr('src', dizUser.picture);

  $('.sharer').attr('href', window.location.origin+window.location.pathname+'?id='+dizUser.id);

  $('.credits b').text(dizUser.credit);
  
  if(dizUser.public == "1"){
    $('input#public').prop( "checked", true );
  }else{
    $('input#public').prop( "checked", false );
  }
  if(dizUser.notify == "1"){
    $('input#notify').prop( "checked", true );
  }else{
    $('input#notify').prop( "checked", false );
  }
  getUserRank();
}

function getUserRank(){
  $.get( "mynote.php", function( data ) {
    data = JSON.parse(data);
    console.log('getUserRank :', data);
    console.log(' -- -- UserNotes :', data.notes);

    if(data.blocked){
      console.log(data.reviewnb);
      $('.alert-box').show();
      $('.alert-box b i').text( 5-data.reviewnb );
      $('.my-profile .picture-rank').text('');
      $('.unblocked').hide();
      $('.blocked').hide();
      $('.rank-history').hide();
    }else{
      if( data.rank ){
        // console.log('getUserRank', data, Math.round(data.rank));
        $('.my-profile .picture-rank').text( Math.round(data.rank) );
        $('.my-profile .text-rank').text( Math.round(data.rank)+'/20' );
        $('.my-profile .nb-rates').text( data.notes.length );
        $('.unblocked').show();
        $('.blocked').hide();
        getNotesHistory(data);
      }else if(data.notes.length<3){
        $('.my-profile .picture-rank').text('');
        $('.unblocked').hide();
        $('.blocked').show();
        $('.rank-history').hide();
      }
    }

    
    
  });
}

function getNotesHistory(data){
  $('.container-rank-history ul').empty().before('<img class="loader-notes-history" src="img/loader02.gif"/>');
  $.each( data.notes, function( key, item ) {
    console.log('NOTE  == ', key, item);
    noteID = item.id;
    noteEmotsID = item.emots_id;
    tnote = item.note;
    $('.container-rank-history ul').append('<li id="'+item.id+'"><span>'+tnote+'</span></li>');
    if(noteEmotsID != 0){
      $.post( "getemots.php", {noteid: noteID, emotsid: noteEmotsID}, function( e ) {
        e = JSON.parse(e);
        // console.log('NOTEID :: ', e);
        $('.container-rank-history ul li#'+e.noteid).append('<img src="img/emots/'+e.emots.picture+'" />');
      });
    }

  });

  $('.loader-notes-history').remove();
}


function registerNewUser(response){
  console.log('registerNewUser : ', response);
  $.post( "register.php", response, function( data ) {
    tData = JSON.parse(data);
    console.log("Data received! :: ", tData);
    dizUser = tData.userInfo;
    appendUserInfo();
    getNotifs();    
    checkState();
  });
}


//SHOW MESSAGE TOP SCREEN
function showMessage(content, time){
  $('body').append('<div class="message-pop">'+content+'</div>');
  setTimeout(function(){
    $('.message-pop').eq(0).fadeOut(300,function(){
      $(this).remove();
    });
  },time);
}
function getNextPeople(callback){
  $('.rank-system .picture_frame-img').attr('src', 'img/loader.gif');
  console.log("getNextPeople *****", dizUser);
  $.post( "getnextpeople.php", dizUser , function( data ) {
    tdata = JSON.parse(data);
    console.log("-- getNextPeople : ", tdata);
    voteUser = tdata;
    if( tdata == "nomorepeople"){
      showMessage("You have already ranked everyone in the game.", 4000);
      return false;
    }
    $('.rank-system .picture_frame-img').attr('src', tdata.picture);
    $('.picture-emots .emots-rank img').attr('src', 'img/plus.png');
    $('.picture-rank input').val(10);
    $('.slidecontainer input').val(10);

    alteredURL = removeParam("id", window.location.href);
    if (window.history.replaceState) {
      window.history.replaceState('Friend Voted', 'The Rank', alteredURL);
      dizUser.friendID = "";
    }
    
    if(callback){
      callback();
    }
  });

  return false;
}

function selectEmots(){
  // console.log("SELECT EMOTS ####");
  $('.emots-rank').off().click(function(){
    // console.log("CLIKED  ####");
    $('.picture-emots .emots-bag').toggle();
  });
  $('.emots-bag ul li').click(function(){
    if( $(this).hasClass('locked')){
      console.log('SHOP');
      shop($(this));
    }
  });

  $('.picture-emots .emots-bag ul li').click(function(){
    cEmot = $(this);
    if(!cEmot.hasClass('locked')){
      cEmotID = cEmot.attr('id');
      $('.emots-rank-input').val(cEmotID);
      $.post( "getemots.php", {emotsid: cEmotID}, function( e ) {
        e = JSON.parse(e);
        // console.log('EMOTS => ', e.emots.picture);
        $('.picture-emots .emots-rank img').attr('src', 'img/emots/'+e.emots.picture);
      });
      $('.picture-emots .emots-bag').hide();
    }
    
  })
}

//SHOP ITEM
function shop(item){
  console.log('SHOP :::::  ', item);
  shopPopup = $('.shop');
  eID = parseInt(item.attr('id'));
  console.log( { emotID : eID } );
  $.post("get-single-emot.php", { emotID : item.attr('id') }, function(data){
    data = JSON.parse(data);
    console.log("get-single-emot.php : ", data);
    shopPopup.find('.shop-icon img').attr('src', 'img/emots/'+data.emotInfo[0].picture).attr('id', item.attr('id'));
    shopPopup.find('.shop-price').text(data.emotInfo[0].price);
    shopPopup.show();
    $('.overlay').show();
  });
  
}

function buytoShop(item){
  $.post("buyshop.php", { userid : dizUser.id, itemid : item }, function(data){
    data = JSON.parse(data);
    console.log("buyshop.php : ", data);
    if( data['buy'] ){
      // getEmotsBag('.rank-system');
      popCoins(-data['price']);
      getUser(function(){
        getEmotsBag('.my-profile');
      });
      
    }else{
      showMessage('You have not enough credits to buy this item',4000);
    }
  });
  shopPopup.hide();
  $('.overlay').hide();
}

function popCoins(nb){
  coinsToPop = Math.abs(nb);
  var bt;
  if(nb>0){
    $('body').append('<div class="coins-win">+'+nb+'</div>');
    new Audio('sounds/wincoin-snd.wav').play();

    if(coinsToPop>10){ 
      coinsToPop = 10;
    }
    for (i = 0; i < coinsToPop; i++) { 
      randLeft = Math.floor(Math.random() * ($(window).width()/3) ) + 10 ;
      ranDelay = Math.floor(Math.random() * 300 ) + 50;
      rC = Math.floor(Math.random() * 2 ) + 1;

      $('body').append('<div class="coin-anim coin-anim-0'+rC+'"></div>');
      
      $('.coin-anim').eq(i).css({'right': randLeft+'px', 'bottom': 150}).delay(ranDelay).animate({'bottom': 0}, 600, function(){
        $('.coins-win, .coins-loose').eq(0).stop().fadeOut(200,function(){
          $(this).remove();
        });
        $(this).delay(ranDelay).stop().fadeOut(200,function(){
          $(this).remove();
        });
      });
    }
  }else{
    $('body').append('<div class="coins-loose">'+nb+'</div>');
    new Audio('sounds/buy-snd.wav').play();

    if(coinsToPop>10){ 
      coinsToPop = 10;
    }
    for (i = 0; i < coinsToPop; i++) { 
      randLeft = Math.floor(Math.random() * ($(window).width()/3) ) + 10 ;
      ranDelay = Math.floor(Math.random() * 300 ) + 50;
      rC = Math.floor(Math.random() * 2 ) + 1;

      $('body').append('<div class="coin-anim coin-anim-0'+rC+'"></div>');
      
      $('.coin-anim').eq(i).css({'right': randLeft+'px', 'bottom': 0}).delay(ranDelay).animate({'bottom': 150}, 600, function(){
        $('.coins-win, .coins-loose').eq(0).stop().fadeOut(200,function(){
          $(this).remove();
        });
        $(this).delay(ranDelay).stop().fadeOut(200,function(){
          $(this).remove();
        });
      });
    }
  }
   
}

function votePeople(){
  note = $('.rank-input input').val();
  noteEmots = $('.emots-rank-input').val();
  noteData = { id : voteUser.id , note : note , emots: noteEmots, voterid : dizUser.id}
  console.log("-- noteData : ", noteData);
  $.post( "postnote.php", noteData , function( data ) {
    data = JSON.parse(data);
    console.log("-- votePeople : ", data);
    if(data.alreadyvoted == 1){
      console.log('ALREADY VOTED');
    }else{
      popCoins(1);
    }

    getNextPeople(false);

  });
  return false;
}

function loadFriend(friendID){
  
  popSection('rank-system');
  console.log('FRIEND ID : ', friendID);
  dizUser.friendID = friendID;
  console.log('dizUser FRIEND : ', dizUser);

  $.post( "getnextpeople.php", dizUser , function( data ) {

      console.log("****** getFriend : ", tdata);
      tdata = JSON.parse(data);
      voteUser = tdata;
      $('.rank-system .picture_frame-img').attr('src', tdata.picture);
      noteD = {"id" : tdata.id, "voterid" : dizUser.id};
      // console.log(noteD);
      $.post( "getnote.php", noteD , function( notedata ) {
        notedata = JSON.parse(notedata);
        console.log(notedata, notedata.noteinfo.note);
        $('.rank-input input').val(notedata.noteinfo.note);
        if( notedata.noteinfo.emots_id != 0 ){
          emotsSrc = $('.picture-emots .emots-bag li').eq(notedata.noteinfo.emots_id-1).find('img').attr('src');
          console.log("IMG EMOTS :: ", emotsSrc);
          $('.emots-rank img').attr('src', emotsSrc); 
        }
      });
    
  });
    
}
//WITH FB
function loadFriend2(friendID){
  
  popSection('rank-system');
  console.log('FRIEND ID : ', friendID);
  dizUser.friendID = friendID;
  console.log('dizUser FRIEND : ', dizUser);

   FB.api('/me','GET',{"fields": "id,name,email,friends", access_token: accessToken},
    function(response) {
      dizUser.friends = response.friends.data;
      $.post( "getnextpeople.php", dizUser , function( data ) {
        if(data=="nofriend"){
          console.log('NOT YOUR FRIEND');
          getNextPeople(false);
          return false;
        }else{
          // console.log("****** getFriend : ", tdata);
          tdata = JSON.parse(data);
          voteUser = tdata;
          $('.rank-system .picture_frame-img').attr('src', tdata.picture);
          noteD = {"id" : tdata.id, "voterid" : dizUser.id};
          // console.log(noteD);
          $.post( "getnote.php", noteD , function( notedata ) {
            notedata = JSON.parse(notedata);
            console.log(notedata, notedata.noteinfo.note);
            $('.rank-input input').val(notedata.noteinfo.note);
            if( notedata.noteinfo.emots_id != 0 ){
              emotsSrc = $('.picture-emots .emots-bag li').eq(notedata.noteinfo.emots_id-1).find('img').attr('src');
              console.log("IMG EMOTS :: ", emotsSrc);
              $('.emots-rank img').attr('src', emotsSrc); 
            }
          });
        }
        

      });

    });
    
}

function removeParam(key, sourceURL) {
    var rtn = sourceURL.split("?")[0],
        param,
        params_arr = [],
        queryString = (sourceURL.indexOf("?") !== -1) ? sourceURL.split("?")[1] : "";
    if (queryString !== "") {
        params_arr = queryString.split("&");
        for (var i = params_arr.length - 1; i >= 0; i -= 1) {
            param = params_arr[i].split("=")[0];
            if (param === key) {
                params_arr.splice(i, 1);
            }
        }
        rtn = rtn + "?" + params_arr.join("&");
    }
    return rtn;
}

function getPhotos(){
  getAlbums();
}



function getAlbums(){
  $('.change-photo-container .grid-photo').empty();
  $('.change-photo-container .grid-photo').before('<img src="img/loader02.gif" class="loader02"/>');
  if( !$('.change-photo-container h3').length){
    $('.change-photo-container').prepend('<h3>Albums</h3>');
  }else{
    $('.change-photo-container h3').text('Albums');
  }

  FB.api('/me?fields=albums.limit(20){name,count,cover_photo{picture},photos.limit(1){picture,images}}', response => {

  // FB.api(
  // '/me/albums',
  // 'GET',
  // {"fields":"cover_photo,id,photos.limit(1){images},count,name","limit":"20", access_token: accessToken},
  // function(response) {
    console.log('ALBUM LIST : ', response);
    $('.loader02').remove();
    $.each( response.albums.data, function( key, item ) {
      // console.log(key, item);
      if( item.count != 0 ){
        imgSrc = item.photos.data["0"].images["0"].source;
        $('.change-photo-container .grid-photo').append('<li class="album" id="'+item.id+'" title="'+item.name+'"><span class="tag">'+item.name+'</span><img src="'+imgSrc+'" /></li>');
      }
    });
    $('.album').click(function(){
      albumName = $(this).attr('title');
      albumId = $(this).attr('id');
      openAlbum(albumId, albumName);
    });
  });
}

function openAlbum(albumId, albumName){
  // console.log('openAlbum : ', albumId, albumName);
  $('.change-photo-container .grid-photo').empty();
  $('.change-photo-container .grid-photo').before('<img src="img/loader02.gif" class="loader02"/>');
  if( !$('.change-photo-container h3').length){
    $('.change-photo-container').prepend('<h3>'+albumName+'</h3>');
  }else{
    $('.change-photo-container h3').text(albumName);
  }
  FB.api(albumId + '/?fields=photos.limit(30){picture,images}', response => {
    // console.log('LIST PHOTOS : ', response);
    $('.loader02').remove();
    $.each( response.photos.data, function( key, item ) {
      // console.log(key, item);
      $('.change-photo-container .grid-photo').append('<li class="choosePhoto" id="'+item.id+'" title="Choose this photo"><img src="'+item.images["0"].source+'" /></li>');
    });
  });

  $('.change-photo-container .grid-photo').on('click','.choosePhoto', function(){
    imgID = $(this).attr('id');
    imgSrc = $(this).find('img').attr('src');
    dataSend = { userid: dizUser.id, imgid: imgID, imgsrc: imgSrc };
    // console.log(dataSend);
    $.post( "updateimg.php", dataSend , function( data ) {
      // console.log("-- updateimg : ", data);
      getUser();
      closePopin();
    });

    
  });

}


function rangeSelector(){
  var slider = $("#myRange");
  var inputV = $('.picture-rank input');

  slider.change(function(){
    inputV.val(slider.val());
  });

  inputV.change(function(){
    slider.val(inputV.val());
  });
}
