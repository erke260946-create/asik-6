// ===== Task 2 =====
var $card=null;

// 1. Spotlight
$(document).on('case:done',function(e,$set,isRoom){
  var $in=isRoom?$set.find('.guest'):$set;
  $('.guest').not($in).stop(true,true).fadeTo(300,0.2);
  $in.fadeTo(300,1);
});
$(document).on('case:clear',function(){ $('.guest').stop(true,true).fadeTo(300,1); });

// 2. Guest card
function infoLines($g){
  var t=$g.attr('data-things'), th=t?t.split(' '):[];
  var l=['Came at '+$g.find('small').text().replace('🕒 ',''), $g.hasClass('aitu')?'AITU student':'Not an AITU student',
         'Wears '+$g.attr('data-color')];
  l.push(th.length?'Has a '+th.join(' and a ').replace('glasses','pair of glasses').replace('cake','cake crumbs'):'Has nothing with them');
  return l;
}
function closeCard(now){
  var $c=$card; if(!$c) return; $card=null; $c.stop(true);
  if(now){$c.remove();return;}
  var r=$c.data('from');
  $c.css('overflow','hidden').animate({left:r.left,top:r.top,width:r.w,height:r.h,opacity:0},250,function(){$c.remove();});
}
function openCard($g){
  $('.info').stop(true).remove(); $card=null;
  var room=$g.closest('.room').attr('data-room');
  var $c=$('<div class="info">').data('guest',$g);
  $('<h4>').text($g.attr('data-name')+' · '+room).appendTo($c);
  $.each(infoLines($g),function(_,s){$('<p>').text(s).appendTo($c);});
  $.each(DATA,function(_,r){
    if(r.room!==room) $('<button class="mv">').attr('data-to',r.room).text('Move to the '+r.room.toLowerCase()).appendTo($c);
  });
  $c.css({visibility:'hidden',width:230,left:0,top:0}).appendTo('body');
  var H=$c.outerHeight(), $img=$g.find('img'), o=$img.offset(), w=$img.outerWidth(), h=$img.outerHeight();
  var L=Math.max(8,Math.min(o.left+w/2-115,$(document).width()-238)), T=o.top+h+8;
  if(T+H>$(document).height()-8) T=Math.max(8,o.top-H-8);
  var from={left:o.left,top:o.top,w:w,h:h};
  $c.data('from',from).css({left:o.left,top:o.top,width:w,height:h,opacity:0.3,overflow:'hidden',visibility:'visible'})
    .animate({left:L,top:T,width:230,height:H,opacity:1},300,function(){$c.css('overflow','visible');});
  $card=$c;
}
$(document).on('click',function(e){
  var $t=$(e.target); if($t.closest('.info').length) return;
  var $g=$t.closest('.guest');
  if($g.length && !$g.hasClass('fly')){ if($card && $card.data('guest')[0]===$g[0]) return; openCard($g); }
  else closeCard();
});
$(document).on('keydown',function(e){ if(e.key==='Escape') closeCard(); });
$(document).on('built',function(){
  closeCard(true);
  $('.room').each(function(){ $('<button class="sort">Sort by time</button>').appendTo($(this).children('h3')); });
});

// 3. Move
function moveGuest($g,to){
  var from=$g.closest('.room').attr('data-room'); if(from===to) return;
  closeCard(true);
  var o=$g.offset(), w=$g.outerWidth(true), h=$g.outerHeight(true), ml=parseInt($g.css('marginLeft'))||0;
  $g.stop(true).css({left:0,top:0});
  var $fly=$g.clone().addClass('fly').css({position:'absolute',left:o.left,top:o.top,margin:0,width:$g.outerWidth()}).appendTo('body');
  var $old=$('<li class="gap">').css({width:w,height:h}).insertBefore($g); $g.detach();
  $old.animate({width:0},600,function(){$(this).remove();});
  var $room=$('.room[data-room="'+to+'"]'), $ul=$room.find('.guests');
  var $new=$('<li class="gap">').css({width:0,height:h}).appendTo($ul).animate({width:w},600);
  var p=$new.offset();
  var maxIdx=Math.max.apply(null,$ul.children('.guest').map(function(){return +$(this).attr('data-idx');}).get().concat(-1));
  $g.attr('data-idx',maxIdx+1);
  // update the array
  var name=$g.attr('data-name'), item;
  $.each(DATA,function(_,r){ $.each(r.guests,function(i,g){ if(g[0]===name){item=r.guests.splice(i,1)[0];return false;} }); });
  $.each(DATA,function(_,r){ if(r.room===to) r.guests.push(item); });
  $fly.animate({left:p.left+ml,top:p.top},700,function(){
    $fly.remove(); $g.css({left:0,top:0,opacity:1}).insertAfter($new); $new.remove();
  });
}
$(document).on('click','.info .mv',function(){ moveGuest($card.data('guest'),$(this).attr('data-to')); });

// 4. Sort by time (toggle)
$(document).on('click','.sort',function(){
  var $room=$(this).closest('.room'), $gs=$room.find('.guest');
  $gs.each(function(){$(this).data('o',$(this).offset());});   // visual position now
  $gs.stop(false,true,false).css({left:0,top:0});               // stop only the slide animations
  var s=!$room.data('sorted'); $room.data('sorted',s);
  var arr=$gs.get().sort(function(a,b){
    return s?$(a).data('time')-$(b).data('time'):$(a).data('idx')-$(b).data('idx');});
  $room.find('.guests').append(arr);
  $(arr).each(function(){
    var o=$(this).data('o'), n=$(this).offset();
    $(this).css({left:o.left-n.left,top:o.top-n.top}).animate({left:0,top:0},{duration:600,queue:false});
  });
});
