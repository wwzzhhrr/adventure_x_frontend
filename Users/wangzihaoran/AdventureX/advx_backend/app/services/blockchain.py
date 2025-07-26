from pyinjective import AsyncClient, PrivateKey, Network, Composer, constants

# 示例：创建钱包
def create_wallet():
    private_key = PrivateKey.generate()
    pub_key = private_key.to_public_key()
    address = pub_key.to_address().init_num_seq(constants.Network.testnet().lb)
    return {
        'wallet_address': address.to_acc_bech32(),
        'wallet_private_key': private_key.to_hex(),
        'wallet_public_key': pub_key.to_hex()
    }

# 示例：获取 INJ 余额
def get_inj_balance(address: str):
    network = constants.Network.testnet()
    client = Client(network, insecure=False)
    balance = client.get_account_balance(address, denom='inj')
    return balance