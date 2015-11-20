Vagrant.configure(2) do |config|
    # config.vm.box = "server-base-v0.3.1"
    # config.vm.box_url = "http://voyager.home.itappert.de/contentloops/base-v0.3.1.box"
    config.vm.box = "ContentLoops/server-base"
    config.vm.box_check_update = true

    config.vm.guest = :linux
    # config.vm.hostname = "contentloops-server.local"
    config.vm.provision "shell", inline: "hostname contentloops-server.local && hostname > /etc/hostname"

    config.vm.post_up_message = "Server is online!"

    config.vm.provider "virtualbox" do |vb|
        vb.memory = 512
        
        ## Enable this to get an interactive VirtualBox GUI
        #vb.gui = true
    end

    config.vm.provision "shell", path: "vagrant-config/bootstrap.sh"
    config.vm.synced_folder "src/", "/srv/server/src"
    config.vm.synced_folder "log/", "/srv/server/log", create: true

    config.ssh.username = "vagrant"
    config.ssh.private_key_path = "vagrant-config/id_rsa"

    config.vm.network "forwarded_port", guest: 8080, host: 8080, auto_correct: true # NodeJS
    config.vm.network "forwarded_port", guest: 27017, host: 8081, auto_correct: true # MongoDB

end