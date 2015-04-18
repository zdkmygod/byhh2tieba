url_redirect();
$(function(){
  modify_page();
});
/**
 *util 
 */
var myutil = {
  //转意符换成普通字符
  escape2Html: function (str) {
    if('string' != typeof(str)) return str;
    var arrEntities={'lt':'<','gt':'>','nbsp':' ','amp':'&','quot':'"'};
    var new_str = str.replace(/&(lt|gt|nbsp|amp|quot);/ig,function(all,t){
      return arrEntities[t];
    })
    return new_str;
  }
}
/**
 *url
 *现在不确定那种办法更好，待修改
 */
function url_redirect() {
  var redirect_list = [
    {'from': /([\s\S]+?.cn)\/main.html([\s\S]*)/, 'to': '$1/bbsmain.html'},
    {'from': /([\s\S]+?.cn)\/cgi-bin\/bbsdoc\?board=([\s\S]+?)/, 'to': '$1/cgi-bin/bbsnewtdoc?board=$2'},
    {'from': /([\s\S]+?.cn)\/cgi-bin\/bbscon\?board=([\s\S]+?)&file=([\s\S]+?)&([\s\S]+)/, 'to': '$1/cgi-bin/bbsnewtcon?board=$2&file=$3'}
  ];
  for(i in redirect_list) {
    var href_path = window.location.href;
    var redir_from = redirect_list[i].from;
    var redir_to = redirect_list[i].to;
    if(redir_from.test(href_path)) {
      var new_href_path = href_path.replace(redir_from, redir_to);
      window.location.href = new_href_path;
    }
  }
}

function modify_page() {
  var page_list = [
    {'page': /^\/cgi-bin\/bbsnewtcon/, 'callback': modify_topic_page},
  ];
  for(i in page_list) {
    var page_reg = page_list[i].page;
    var callback_func = page_list[i].callback;
    var path_name = window.location.pathname;
    if(page_reg.test(path_name)) callback_func();
  }
}

var modify_topic_page = function modify_topic_page() {
  /**
   *structure
   */
  var page_main = $('#main');
  page_main.wrapInner('<div id="post_main"><div>');
  page_main.wrapInner('<div id="post"></div>');
  var post_main = $('#post_main');
  $('<div id="post_top"></div>').insertBefore(post_main);
  $('<div id="post_foot"></div>').insertAfter(post_main);
  $('#post_main>div').attr('id', 'post_main_notside');
  post_main.append($('<div id="post_main_side"></div>'));
  page_main.css('display','block');
  /**
   * topic title
   */
  var topic_title = $('.articletopinfo');
  var topic_title_html = topic_title.html();
  var topic_title_match = topic_title_html.match(/<a href="([\s\S]+?)">([\s\S]+?)<\/a>/g);
  var topic_detail = [];
  for(var i=0;i<4;i++){
      topic_detail[i] = topic_title_match[i].match(/<a href="([\s\S]+?)">([\s\S]+?)<\/a>/);
  }
  var title_wrap = $('<div class="core_title"></div>');
  var title_h1_content_temp = topic_detail[3][2].match(/\《([\s\S]+?)\》/);
  var title_h1_content = title_h1_content_temp[1];
  var title_h1 = $('<h1 class="core_title_txt"></h1>').text(title_h1_content);
  title_wrap.append(title_h1);
  var title_btns = $('<ul class="core_title_btns"></ul>');
  //
  var lz_article_link_temp = $('.prearticle').eq(0).html().match(/本篇全文<\/a>\] \[<a href="([\s\S]+?)">只看该作者<\/a>/);
  var title_lz_link = myutil.escape2Html(lz_article_link_temp[1]);
  var title_btns_lz = $('<li><a href="#" class="l_lzonly"><p>只看楼主</p></a></li>');
  title_btns_lz.find('a.l_lzonly').eq(0).attr('href', title_lz_link);
  title_btns.append(title_btns_lz);
  //fuck
  var all_article_link_temp = $('#main>a').attr('href');
  var title_all_link = myutil.escape2Html(all_article_link_temp);
  var title_btns_all = $('<li><a href="#" class="l_lzonly"><p>所有帖子</p></a></li>');
  title_btns_all.find('a.l_lzonly').eq(0).attr('href', title_all_link);
  title_btns.append(title_btns_all);
  //
  var reply_article_link_temp = $('.prearticle').eq(0).html().match(/<a href="([\s\S]+?)">回贴<\/a>/);
  var title_reply_link = myutil.escape2Html(reply_article_link_temp[1]);
  var title_btns_reply = $('<li><a href="#" class="l_lzonly id="reply"><p class="j_quick_reply">回复</p></a></li>');
  title_btns_reply.find('a.l_lzonly').eq(0).attr('href', title_reply_link);
  title_btns.append(title_btns_reply);
  title_wrap.append(title_btns);
  var title_after = $('.divarticle').eq(0);
  title_wrap.insertBefore(title_after);
  /**
   *user info 
   */
  var user_info_list = document.querySelectorAll('.tduserinfo');
  for(var i=0;i<user_info_list.length;i++){
    var user_info = user_info_list[i];
    var user_name = user_info.getElementsByTagName('a')[0];
    var user_face = user_info.getElementsByTagName('img')[0];
    var user_detail = user_info.getElementsByTagName('table')[0];
    var user_id_href = user_name.getAttribute('href');
    //
    var user_face_link = document.createElement('a');
    user_face_link.setAttribute('class', 'p_user_face');
    user_face_link.setAttribute('href', user_id_href);
    user_face_link.appendChild(user_face);
    //
    user_info.insertBefore(user_face_link, user_detail);
    var user_name_container = document.createElement('div');
    user_name_container.setAttribute('class', 'user_name_div');
    user_name_container.appendChild(user_name);
    user_info.insertBefore(user_name_container, user_detail);
    //
    var user_detail_html = user_detail.innerHTML;
    user_detail_rank = user_detail_html.match(/<td>等级：<\/td><td>([\w\W]+?)<\/td>/)[1];
    user_detail_experience = user_detail_html.match(/<td>积分：<\/td><td>([\w\W]+?)<\/td>/)[1];
    var user_is_lz = (0 === i) ? true : false;
    var user_rank_container = document.createElement('div');
    user_rank_container.setAttribute('class', 'l_badge');
    var user_rank_wrap = document.createElement('div');
    user_rank_wrap.setAttribute('class', 'p_badge');
    var user_rank_a = document.createElement('a');
    var user_rank_class = user_is_lz ? 'user_badge d_badge_bright d_badge_lz_icon' : 'user_badge d_badge_bright d_badge_icon';
    user_rank_a.setAttribute('class', user_rank_class);
    user_rank_a.setAttribute('title', '积分 '+user_detail_experience);
    var user_rank_a_title = document.createElement('div');
    user_rank_a_title.setAttribute('class', 'd_badge_title');
    user_rank_a_title.innerText = user_detail_rank;
    var user_rank_a_badge = document.createElement('div');
    user_rank_a_badge.setAttribute('class', 'd_badge_lv');
    user_rank_a.appendChild(user_rank_a_title);
    user_rank_a.appendChild(user_rank_a_badge);
    user_rank_wrap.appendChild(user_rank_a);
    user_rank_container.appendChild(user_rank_wrap);
    user_info.insertBefore(user_rank_container, user_detail);
  }
  /**
   * post article
   */
  var post_list = document.getElementsByClassName('prearticle');
  for(var i=0;i<post_list.length;i++){
    var html = post_list[i].innerHTML;
    var content = html.match(/([\s\S]+?)\n\n([\s\S]+?)\n([-]+)\n([\s\S]+?)/);
    //
    var new_dom = document.createElement('p');
    new_dom.innerHTML = content[2];
    post_list[i].parentNode.appendChild(new_dom);
  }
  /**
   * footer
   */
}
  
  
  
  
  
  
  