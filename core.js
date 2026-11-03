var COLORS={red:'#d9343b',blue:'#2a62d6',green:'#2a9d5c',black:'#222',yellow:'#e8a920',purple:'#8a4fd0'};
var ICON={phone:'📱',glasses:'👓',bag:'👜',cup:'☕',cake:'🍰'};
function mins(t){var p=t.split(':');return +p[0]*60 + +p[1];}

function makeCard(g, idx){
  var name=g[0],color=g[1],time=g[2],aitu=g[3],things=g[4];
  var $c=$('<li>').addClass('guest '+things.join(' ')).toggleClass('aitu',!!aitu)
    .attr({'data-name':name,'data-color':color,'data-time':mins(time),'data-things':things.join(' '),'data-idx':idx});
  $('<img>').attr('src','https://api.dicebear.com/9.x/open-peeps/svg?seed='+name).css('border-color',COLORS[color]).appendTo($c);
  $('<b>').text(name).appendTo($c);
  $('<small>').text('🕒 '+time).appendTo($c);
  $('<span class="things">').text(things.map(function(t){return ICON[t];}).join(' ')||'\u00a0').appendTo($c);
  if(aitu) $('<i class="badge">🎓</i>').appendTo($c);
  return $c;
}

function build(){
  $('#house').empty();
  $.each([2,1],function(_,f){
    var $fl=$('<div class="floor">').attr('data-floor',f).append($('<div class="label">').text('FLOOR '+f)).appendTo('#house');
    $.each(DATA,function(_,r){
      if(r.floor!==f) return;
      var $room=$('<div class="room">').attr('data-room',r.room).appendTo($fl);
      $('<h3>').text(r.room).appendTo($room);
      var $ul=$('<ul class="guests">').appendTo($room);
      $.each(r.guests,function(i,g){ $ul.append(makeCard(g,i)); });
    });
  });
  $(document).trigger('built');
}

// ---- 20 cases: every one is a jQuery chain that searches the PAGE ----
function inTime(a,b){return function(){var t=$(this).data('time');return t>=a&&t<=b;};}
var CASES=[
 {t:'Who is in the hall?', f:function(){return $('.room[data-room="Hall"] .guest');}},
 {t:'Dressed in yellow or purple', f:function(){return $('.guest[data-color="yellow"], .guest[data-color="purple"]');}},
 {t:'AITU students upstairs', f:function(){return $('.floor[data-floor="2"] .guest.aitu');}},
 {t:'Glasses or a bag', f:function(){return $('.guest.glasses, .guest.bag');}},
 {t:'Came with nothing', f:function(){return $('.guest[data-things=""]');}},
 {t:'Phone but no bag', f:function(){return $('.guest.phone:not(.bag)');}},
 {t:'Arrived 20:30-21:00', f:function(){return $('.guest').filter(inTime(1230,1260));}},
 {t:'After 21:00, not AITU', f:function(){return $('.guest:not(.aitu)').filter(inTime(1261,9999));}},
 {t:'Right next to Askar', f:function(){var $a=$('.guest[data-name="Askar"]');return $a.prev().add($a.next());}},
 {t:'Last in each room', f:function(){return $('.guest:last-child');}},
 {t:'Third in each room', f:function(){return $('.guest:nth-child(3)');}},
 {t:'After Timur', f:function(){return $('.guest[data-name="Timur"]').nextAll();}},
 {t:'Right before someone in black', f:function(){return $('.guest[data-color="black"]').prev();}},
 {t:'Room of Aruzhan', rooms:1, f:function(){return $('.guest[data-name="Aruzhan"]').closest('.room');}},
 {t:'Rooms with < 6 guests', rooms:1, f:function(){return $('.room').filter(function(){return $(this).find('.guest').length<6;});}},
 {t:'Cup, but nobody in glasses', rooms:1, f:function(){return $('.room:has(.guest.cup):not(:has(.guest.glasses))');}},
 {t:'First to each room', f:function(){return $($('.room').map(function(){
    return $(this).find('.guest').get().sort(function(a,b){return $(a).data('time')-$(b).data('time');})[0];}).get());}},
 {t:'Miras joins Askar and Inkar', f:function(){
    var $a=$('.guest[data-name="Askar"]');
    return makeCard(['Miras','blue','21:20',1,['phone']],$a.data('idx')+0.5).hide().insertAfter($a).fadeIn(700);}},
 {t:'Natasha goes home', f:function(){
    return $('.guest[data-name="Natasha"]').fadeOut(700,function(){$(this).remove();});}},
 {t:'Who took the cake?', f:function(){
    return $('.floor[data-floor="1"] .guest.cake:not(.cup)').filter(inTime(1261,1289))
      .filter(function(){return $(this).prev().add($(this).next()).filter('.aitu').length>0;});}}
];

function runCase(i){
  build();
  var c=CASES[i], $r=c.f();
  $r.addClass('found');
  if(!c.rooms) $r.animate({top:-14},150).animate({top:0},150);
  var names=$r.map(function(){return $(this).data('name')||$(this).data('room');}).get();
  $('#result').text((i+1)+'. '+c.t+' → '+names.length+': '+names.join(', '));
  $(document).trigger('case:done',[$r,!!c.rooms]);
}

$(function(){
  $.each(CASES,function(i,c){
    $('<button>').text(i+1).attr('title',c.t).on('click',function(){runCase(i);}).appendTo('#cases');
  });
  $('#clear').on('click',function(){
    $('.found').removeClass('found'); $('#result').text('');
    $(document).trigger('case:clear');
  });
  build();
});