import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

class ChatPage extends StatefulWidget {
  const ChatPage({super.key});
  @override
  State<ChatPage> createState() => _ChatPageState();
}

class _ChatPageState extends State<ChatPage> {
  final ctrl = TextEditingController();
  List<Map<String,String>> messages = [];
  Map<String,dynamic>? data;
  String lang = 'en';

  Future<void> load() async {
    final s = await rootBundle.loadString('assets/chatbot/$lang.json');
    data = jsonDecode(s);
  }

  @override
  void initState() {
    super.initState();
    load();
  }

  void send() {
    final text = ctrl.text.trim(); if (text.isEmpty) return;
    messages.add({'role':'user','text': text});
    final lower = text.toLowerCase();
    String? resp;
    for (final intent in data?['intents'] ?? []) {
      for (final kw in intent['keywords']) {
        if (lower.contains(kw.toString().toLowerCase())) { resp = intent['response']; break; }
      }
      if (resp != null) break;
    }
    resp ??= data?['fallback'] ?? '...';
    messages.add({'role':'assistant','text': resp});
    setState((){});
    ctrl.clear();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Assistant'), actions: [
        DropdownButton<String>(value: lang, underline: Container(), items: const [DropdownMenuItem(value:'en',child:Text('EN')), DropdownMenuItem(value:'hi',child:Text('HI'))], onChanged: (v) { if (v!=null) { setState(()=>lang=v); load(); } })
      ]),
      body: Column(children: [
        Expanded(child: ListView.builder(itemCount: messages.length, itemBuilder: (c,i){
          final m = messages[i];
          final isUser = m['role']=='user';
          return Align(alignment: isUser? Alignment.centerRight: Alignment.centerLeft, child: Container(margin: const EdgeInsets.all(8), padding: const EdgeInsets.all(10), decoration: BoxDecoration(color: isUser? Colors.blue.shade50: Colors.grey.shade200, borderRadius: BorderRadius.circular(8)), child: Text(m['text'] ?? '')));
        })),
        Padding(padding: const EdgeInsets.all(8), child: Row(children: [
          Expanded(child: TextField(controller: ctrl, decoration: const InputDecoration(hintText: 'Type...'))),
          IconButton(onPressed: send, icon: const Icon(Icons.send))
        ]))
      ])
    );
  }
}
